// Jest test for createNilai in dosen.js

import { createNilai } from "../dosen.js";
import pool from "../../db/db.js";

jest.mock("../../db/db.js");

describe("createNilai", () => {
  let req, res, client;

  beforeEach(() => {
    client = {
      query: jest.fn(),
      connect: jest.fn().mockResolvedValue(client),
      release: jest.fn(),
    };

    pool.connect.mockResolvedValue(client);

    req = {
      body: {
        idSidang: "1",
        roleDosen: "Ketua Tim Penguji",
        arrKomponenDanNilai: [
          { idKomponen: 1, nilai: 80 },
          { idKomponen: 2, nilai: 90 },
          { idKomponen: 3, nilai: 100 },
        ],
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Unit test pertama
  it("Berhasil memasukan/mengubah nilai dengan perhitungan nilai yang tepat, dimulai dengan transaction dan diakhiri dengan commit", async () => {
    // Nilai dari req.body
    const idSidang = parseInt(req.body.idSidang);
    const roleDosen = req.body.roleDosen;
    const nilai1 = req.body.arrKomponenDanNilai[0].nilai;
    const nilai2 = req.body.arrKomponenDanNilai[1].nilai;
    const nilai3 = req.body.arrKomponenDanNilai[2].nilai;

    // Misal bobot yang didapat dari tabel komponen nilai nya adalah:
    const bobot1 = 0.35; // Bobot untuk idKomponen 1
    const bobot2 = 0.4; // Bobot untuk idKomponen 2
    const bobot3 = 0.25; // Bobot untuk idKomponen 3

    // Misal persentaseDosen yang didapat dari tabel persentase adalah:
    const persentaseDosen = 35;

    // Hitung nilai total yang nanti akan menjadi expected value:
    const nilaiTotal = nilai1 * bobot1 + nilai2 * bobot2 + nilai3 * bobot3;

    // Hitung nilai akhir (nilai total dikali persentase) yang nanti akan menjadi expected value:
    const nilaiAkhir = (nilaiTotal * persentaseDosen) / 100;

    client.query.mockResolvedValueOnce(); // BEGIN

    // (Iterasi pertama untuk nilai1)
    client.query.mockResolvedValueOnce(); // INSERT INTO Nilai
    client.query.mockResolvedValueOnce({
      rows: [{ totalNilai: nilai1 * bobot1 }],
    }); // SELECT totalNilai

    // (Iterasi kedua untuk nilai2)
    client.query.mockResolvedValueOnce(); // INSERT INTO Nilai
    client.query.mockResolvedValueOnce({
      rows: [{ totalNilai: nilai2 * bobot2 }],
    }); // SELECT totalNilai

    // (Iterasi ketiga untuk nilai3)
    client.query.mockResolvedValueOnce(); // INSERT INTO Nilai
    client.query.mockResolvedValueOnce({
      rows: [{ totalNilai: nilai3 * bobot3 }],
    }); // SELECT totalNilai

    client.query.mockResolvedValueOnce({ rows: [] }); // NilaiDiBAP query

    client.query.mockResolvedValueOnce({
      rows: [{ persentase: persentaseDosen }],
    }); // PersentaseNilai query

    client.query.mockResolvedValueOnce(); // INSERT INTO NilaiDiBAP
    client.query.mockResolvedValueOnce(); // COMMIT

    await createNilai(req, res);

    console.log("Mock calls:", client.query.mock.calls);

    // ----------------------------------------------------------------------------------------
    // Expected result:

    // dimulai dengan transaction (ditandai dengan kata "BEGIN" pada query)
    expect(client.query).toHaveBeenCalledWith("BEGIN");

    // nilai-nilai yang dimasukan pada BAP tepat sesuai perhitungan yang seharusnya
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining(
        `INSERT INTO
        NilaiDiBAP(idSidang, role, persentase, nilai, nilaiAkhir)`
      ),
      [
        idSidang, // idSidang
        roleDosen, // role
        persentaseDosen, // persentase
        nilaiTotal, // nilaiKaliBobot
        nilaiAkhir, // nilaiAkhir
        nilaiTotal, // nilaiKaliBobot (update bagian)
        nilaiAkhir, // nilaiAkhir (update bagian)
      ]
    );
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  // Unit test kedua
  it("Error jika input pada req.body tidak lengkap dan melakukan ROLLBACK", async () => {
    req.body.idSidang = undefined; // misalnya idSidang bernilai undefined pada req.body

    await createNilai(req, res);

    // Melakukan ROLLBACK pada transaction
    expect(client.query).toHaveBeenCalledWith("ROLLBACK");

    // Mengembalikan status code 400, yaitu Bad Request Error
    expect(res.status).toHaveBeenCalledWith(400);

    // Mengembalikan pesan error yang sesuai
    expect(res.json).toHaveBeenCalledWith({
      error: "All specified field must be included",
    });
  });

  // Unit test ketiga
  it("Error jika terjadi kegagalan pada database dan melakukan ROLLBACK", async () => {
    // Misalnya terjadi database error
    client.query.mockRejectedValueOnce(new Error("Database error"));

    await createNilai(req, res);

    // Melakukan ROLLBACK pada transaction
    expect(client.query).toHaveBeenCalledWith("ROLLBACK");

    // Mengembalikan status code 500, yaitu Internal Server Error
    expect(res.status).toHaveBeenCalledWith(500);

    // Mengembalikan pesan error yang sesuai
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
  });
});
