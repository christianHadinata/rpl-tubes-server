import { createNilai } from "../dosen.js"; // Ganti path relatif jika berbeda
import pool, { connect } from "../../db/db.js"; // Mock database pool

jest.mock("../../db/db.js", () => ({
  __esModule: true,
  default: {
    connect: jest.fn(),
  },
  connect: jest.fn(),
}));

describe("createNilai Controller", () => {
  let mockClient;
  let req;
  let res;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };

    // Mock the pool's connect method
    pool.connect = jest.fn().mockResolvedValue(mockClient);

    // Also mock the named export connect function
    connect.mockResolvedValue(mockClient);

    req = {
      body: {
        idSidang: "1",
        roleDosen: "Reviewer",
        arrKomponenDanNilai: [
          { idKomponen: 1, nilai: 80 },
          { idKomponen: 2, nilai: 90 },
        ],
      },
    };

    res = {
      json: jest.fn(),
      status: jest.fn(() => res),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should insert new records into the database", async () => {
    // Mock DB responses for insert scenario
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({}) // Insert Nilai (No conflict)
      .mockResolvedValueOnce({ rows: [{ totalNilai: 40 }] }) // Get Nilai
      .mockResolvedValueOnce({}) // Insert Nilai (No conflict)
      .mockResolvedValueOnce({ rows: [{ totalNilai: 60 }] }) // Get Nilai
      .mockResolvedValueOnce({ rows: [] }) // Persentase from NilaiDiBAP
      .mockResolvedValueOnce({ rows: [{ persentase: 50 }] }) // Persentase from PersentaseNilai
      .mockResolvedValueOnce({}); // Insert NilaiDiBAP

    await createNilai(req, res);

    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO Nilai"),
      expect.any(Array)
    );
    expect(mockClient.query).toHaveBeenCalledTimes(8); // All queries executed
    expect(res.json).toHaveBeenCalledWith({ success: true });
    expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
  });

  it("should update existing records in the database", async () => {
    // Mock DB responses for update scenario
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({}) // Update Nilai (Conflict resolution)
      .mockResolvedValueOnce({ rows: [{ totalNilai: 50 }] }) // Get Nilai
      .mockResolvedValueOnce({}) // Update Nilai (Conflict resolution)
      .mockResolvedValueOnce({ rows: [{ totalNilai: 70 }] }) // Get Nilai
      .mockResolvedValueOnce({ rows: [] }) // Persentase from NilaiDiBAP
      .mockResolvedValueOnce({ rows: [{ persentase: 50 }] }) // Persentase from PersentaseNilai
      .mockResolvedValueOnce({}); // Update NilaiDiBAP

    await createNilai(req, res);

    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining("DO UPDATE"),
      expect.any(Array)
    );
    expect(mockClient.query).toHaveBeenCalledTimes(8); // All queries executed
    expect(res.json).toHaveBeenCalledWith({ success: true });
    expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
  });

  it("should handle errors during the insert operation", async () => {
    mockClient.query.mockRejectedValueOnce(
      new Error("Insert operation failed")
    );

    await expect(createNilai(req, res)).rejects.toThrow(
      "An unexpected error occurred"
    );
    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });

  it("should handle errors during the update operation", async () => {
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockRejectedValueOnce(new Error("Update operation failed"));

    await expect(createNilai(req, res)).rejects.toThrow(
      "An unexpected error occurred"
    );
    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });
});