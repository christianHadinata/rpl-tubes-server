import { createNilai } from "../koordinator.js"; // Ganti path relatif jika berbeda
import pool, { connect } from "../../db/db.js"; // Mock database pool

jest.mock("../../db/db.js", () => ({
  __esModule: true,
  default: {
    connect: jest.fn(),
  },
  connect: jest.fn(),
}));

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockRequest = (body) => ({ body });

describe("createNilai Controller", () => {
  let client;

  beforeEach(() => {
    client = {
      query: jest.fn(),
      release: jest.fn(),
    };
    // Mock the pool's connect method
    pool.connect = jest.fn().mockResolvedValue(mockClient);

    // Also mock the named export connect function
    connect.mockResolvedValue(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a new nilai when it does not exist", async () => {
    const req = mockRequest({ idSidang: "1", nilai: "90" });
    const res = mockResponse();

    // Mock database responses
    client.query
      .mockResolvedValueOnce({ rows: [{ idKomponen: 1 }] }) // Mock get idKomponen
      .mockResolvedValueOnce({ rows: [] }) // Mock nilai not exist
      .mockResolvedValueOnce() // Mock insert nilai
      .mockResolvedValueOnce({ rows: [{ totalNilai: 80 }] }) // Mock totalNilai
      .mockResolvedValueOnce({ rows: [{ persentase: 50 }] }) // Mock persentase
      .mockResolvedValueOnce(); // Mock insert NilaiDiBAP

    await createNilai(req, res);

    expect(client.query).toHaveBeenCalledTimes(6);
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT\n      kn.idKomponen AS "idKomponen"')
    );
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining(
        "INSERT INTO\n          Nilai(idKomponen, idSidang, nilaiDiberi)"
      ),
      [1, 1, 90]
    );
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it("should update existing nilai", async () => {
    const req = mockRequest({ idSidang: "1", nilai: "95" });
    const res = mockResponse();

    // Mock database responses
    client.query
      .mockResolvedValueOnce({ rows: [{ idKomponen: 1 }] }) // Mock get idKomponen
      .mockResolvedValueOnce({ rows: [{ idKomponen: 1 }] }) // Mock nilai exists
      .mockResolvedValueOnce() // Mock update nilai
      .mockResolvedValueOnce({ rows: [{ totalNilai: 85 }] }) // Mock totalNilai
      .mockResolvedValueOnce({ rows: [{ persentase: 50 }] }) // Mock persentase
      .mockResolvedValueOnce(); // Mock update NilaiDiBAP

    await createNilai(req, res);

    expect(client.query).toHaveBeenCalledTimes(6);
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE\n          Nilai"),
      [95, 1, 1]
    );
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it("should rollback transaction and throw error on failure", async () => {
    const req = mockRequest({ idSidang: "1", nilai: "90" });
    const res = mockResponse();

    client.query
      .mockResolvedValueOnce({ rows: [{ idKomponen: 1 }] }) // Mock get idKomponen
      .mockRejectedValueOnce(new Error("Database error")); // Mock database error

    await expect(createNilai(req, res)).rejects.toThrow(
      "An unexpected error occurred"
    );

    expect(client.query).toHaveBeenCalledWith("ROLLBACK");
    expect(res.json).not.toHaveBeenCalled();
  });
});