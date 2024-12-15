// Jest test for createDataSidang in sidang.js

import { createDataSidang } from "../koordinator.js";
import pool from "../../db/db.js";

jest.mock("../../db/db.js");

describe("createDataSidang", () => {
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
        emailMahasiswa: "6182201022@student.unpar.ac.id",
        judulSkripsi:
          "Pembuatan Sistem Probabilitas dengan Menggunakan Algoritma Fuzzy",
        TA: "2",
        tahunAjaran: "GENAP 2024/2025",
        emailPembimbingUtama: "husnul@unpar.ac.id",
        emailPembimbingPendamping: "luciana@unpar.ac.id",
        emailPengujiUtama: "keenan@unpar.ac.id",
        emailPengujiPendamping: "raymond@unpar.ac.id",
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
  it("Berhasil membuat data sidang dengan semua data valid dan dilakukan dengan transaction", async () => {
    // misal idSidang yang di return dari pembuatan row pada tabel sidang adalah 1
    const idSidang = 1;

    client.query.mockResolvedValueOnce(); // BEGIN

    client.query.mockResolvedValueOnce({
      rows: [{ idSidang: 1 }],
    }); // INSERT INTO Sidang me return idSidang yaitu 1

    // INSERT INTO PenggunaMengikutiSidang untuk setiap pengguna
    client.query.mockResolvedValueOnce();
    client.query.mockResolvedValueOnce();
    client.query.mockResolvedValueOnce();
    client.query.mockResolvedValueOnce();
    client.query.mockResolvedValueOnce();
    client.query.mockResolvedValueOnce();

    client.query.mockResolvedValueOnce(); // COMMIT

    await createDataSidang(req, res);
    console.log("Mock calls:", client.query.mock.calls);

    // ----------------------------------------------------------------------------------------
    // Expected result:

    // dimulai dengan transaction (ditandai dengan kata "BEGIN" pada query)
    expect(client.query).toHaveBeenCalledWith("BEGIN");

    // membuat data sidang dari data req.body dan memasukan pada tabel Sidang
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO Sidang"),
      [
        "Pembuatan Sistem Probabilitas dengan Menggunakan Algoritma Fuzzy",
        "2",
        "GENAP 2024/2025",
      ]
    );

    // memasukan Mahasiswa ke tabel PenggunaMengikutiSidang
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO PenggunaMengikutiSidang"),
      ["6182201022@student.unpar.ac.id", idSidang, "Mahasiswa"]
    );

    // memasukan Pembimbing Utama ke tabel PenggunaMengikutiSidang
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO PenggunaMengikutiSidang"),
      ["husnul@unpar.ac.id", idSidang, "Pembimbing Utama"]
    );

    // memasukan Pembimbing Pendamping ke tabel PenggunaMengikutiSidang
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO PenggunaMengikutiSidang"),
      ["luciana@unpar.ac.id", idSidang, "Pembimbing Pendamping"]
    );

    // memasukan Ketua Tim Penguji ke tabel PenggunaMengikutiSidang
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO PenggunaMengikutiSidang"),
      ["keenan@unpar.ac.id", idSidang, "Ketua Tim Penguji"]
    );

    // memasukan Anggota Tim Penguji ke tabel PenggunaMengikutiSidang
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO PenggunaMengikutiSidang"),
      ["raymond@unpar.ac.id", idSidang, "Anggota Tim Penguji"]
    );

    // memasukan Koordinator ke tabel PenggunaMengikutiSidang
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO PenggunaMengikutiSidang"),
      ["mariskha@unpar.ac.id", idSidang, "Koordinator"]
    );

    // transaction diakhiri dengan kata COMMIT
    expect(client.query).toHaveBeenCalledWith("COMMIT");

    // me return json dengan status success: true
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  // unit test kedua
  it("Bisa membuat sidang dengan hanya ada pembimbing utama (tidak ada pembimbing pendamping)", async () => {
    // misal tidak ada pembimbing pendamping yang dipilih
    // ditandai dengan tidak adanya email pembimbing pendamping pada req.body
    req.body.emailPembimbingPendamping = "";

    const idSidang = 1;

    client.query.mockResolvedValueOnce(); // BEGIN

    client.query.mockResolvedValueOnce({
      rows: [{ idSidang: 1 }],
    }); // INSERT INTO Sidang me return idSidang yaitu 1

    // INSERT INTO PenggunaMengikutiSidang untuk setiap pengguna
    client.query.mockResolvedValueOnce();
    client.query.mockResolvedValueOnce();
    client.query.mockResolvedValueOnce();
    client.query.mockResolvedValueOnce();
    client.query.mockResolvedValueOnce();
    client.query.mockResolvedValueOnce();

    client.query.mockResolvedValueOnce(); // COMMIT

    await createDataSidang(req, res);
    console.log("Mock calls:", client.query.mock.calls);

    // ----------------------------------------------------------------------------------------
    // Expected result:

    // dimulai dengan transaction (ditandai dengan kata "BEGIN" pada query)
    expect(client.query).toHaveBeenCalledWith("BEGIN");

    // membuat data sidang dari data req.body dan memasukan pada tabel Sidang
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO Sidang"),
      [
        "Pembuatan Sistem Probabilitas dengan Menggunakan Algoritma Fuzzy",
        "2",
        "GENAP 2024/2025",
      ]
    );

    // memasukan Mahasiswa ke tabel PenggunaMengikutiSidang
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO PenggunaMengikutiSidang"),
      ["6182201022@student.unpar.ac.id", idSidang, "Mahasiswa"]
    );

    // memasukan Pembimbing Utama ke tabel PenggunaMengikutiSidang
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO PenggunaMengikutiSidang"),
      ["husnul@unpar.ac.id", idSidang, "Pembimbing Utama"]
    );

    // memasukan Pembimbing Pendamping ke tabel PenggunaMengikutiSidang
    // karena tidak ada Pembimbing Pendamping yang dipilih, maka seharusnya email yang dimasukan pada tabel adalah "-" untuk menandai tidak ada Pembimbing Pendamping
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO PenggunaMengikutiSidang"),
      ["-", idSidang, "Pembimbing Pendamping"]
    );

    // memasukan Ketua Tim Penguji ke tabel PenggunaMengikutiSidang
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO PenggunaMengikutiSidang"),
      ["keenan@unpar.ac.id", idSidang, "Ketua Tim Penguji"]
    );

    // memasukan Anggota Tim Penguji ke tabel PenggunaMengikutiSidang
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO PenggunaMengikutiSidang"),
      ["raymond@unpar.ac.id", idSidang, "Anggota Tim Penguji"]
    );

    // memasukan Koordinator ke tabel PenggunaMengikutiSidang
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO PenggunaMengikutiSidang"),
      ["mariskha@unpar.ac.id", idSidang, "Koordinator"]
    );

    // transaction diakhiri dengan kata COMMIT
    expect(client.query).toHaveBeenCalledWith("COMMIT");

    // me return json dengan status success: true
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  // unit test ketiga
  it("Melakukan ROLLBACK jika gagal memasukkan pengguna ke PenggunaMengikutiSidang", async () => {
    // misal idSidang yang di return dari pembuatan row pada tabel sidang adalah 1
    const idSidang = 1;

    client.query.mockResolvedValueOnce(); // BEGIN
    client.query.mockResolvedValueOnce({ rows: [{ idSidang }] }); // INSERT INTO Sidang

    // Error saat memasukan pengguna ke PenggunaMengikutiSidang
    client.query.mockRejectedValueOnce(
      new Error("Failed to insert into PenggunaMengikutiSidang")
    );

    await createDataSidang(req, res);

    // Melakukan ROLLBACK pada transaction
    expect(client.query).toHaveBeenCalledWith("ROLLBACK");

    // Mengembalikan status code 500, yaitu Internal Server Error
    expect(res.status).toHaveBeenCalledWith(500);

    // Mengembalikan pesan error yang sesuai
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to insert into PenggunaMengikutiSidang",
    });
  });

  // unit test keempat
  it("Error jika input pada req.body tidak lengkap dan melakukan ROLLBACK", async () => {
    // misalkan judulSkripsi tidak diinputkan pada req.body
    req.body.judulSkripsi = undefined;

    await createDataSidang(req, res);

    // Melakukan ROLLBACK pada transaction
    expect(client.query).toHaveBeenCalledWith("ROLLBACK");

    // Mengembalikan status code 400, yaitu Bad Request Error
    expect(res.status).toHaveBeenCalledWith(400);

    // Mengembalikan pesan error yang sesuai
    expect(res.json).toHaveBeenCalledWith({
      error: "All specified field must be included",
    });
  });

  // Unit test kelima
  it("Error jika terjadi kegagalan pada database dan melakukan ROLLBACK", async () => {
    // Misalnya terjadi database error
    client.query.mockRejectedValueOnce(new Error("Database error"));

    await createDataSidang(req, res);

    // Melakukan ROLLBACK pada transaction
    expect(client.query).toHaveBeenCalledWith("ROLLBACK");

    // Mengembalikan status code 500, yaitu Internal Server Error
    expect(res.status).toHaveBeenCalledWith(500);

    // Mengembalikan pesan error yang sesuai
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
  });
});
