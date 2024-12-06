import pool from "../db/db.js";
import { InternalServerError } from "../errors/InternalServerError.js";

export const getAllMahasiswa = async (req, res) => {
  const textQuery = `SELECT 
        p.nama AS "namaMahasiswa", 
        m.email AS "emailMahasiswa", 
        m.npm AS "npmMahasiswa" 
    FROM 
        Pengguna p
    INNER JOIN
        Mahasiswa m
    ON
        p.email = m.email`;

  const queryResult = await pool.query(textQuery);

  return res.status(200).json(queryResult.rows);
};

export const createDataSidang = async (req, res) => {
  const {
    emailMahasiswa,
    judulSkripsi,
    TA,
    tahunAjaran,
    emailPembimbingUtama,
    emailPembimbingPendamping,
    emailPengujiUtama,
    emailPengujiPendamping,
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // buat sidang ke database
    const createSidangQuery = `
    INSERT INTO Sidang 
      (judulSkripsi, TA, tahunAjaran)
    VALUES
      ($1, $2, $3)
    RETURNING
      idSidang AS "idSidang"
    `;
    const createSidangValues = [judulSkripsi, TA, tahunAjaran];
    const createSidangQueryResult = await client.query(
      createSidangQuery,
      createSidangValues
    );

    // dapet idSidang dari database
    const idSidang = createSidangQueryResult.rows[0].idSidang;

    // buat PenggunaMengikutiSidang query
    const penggunaMengikutiSidangQuery = `
    INSERT INTO PenggunaMengikutiSidang 
      (email, idSidang, role)
    VALUES
      ($1, $2, $3)
    `;

    // masukin mahasiswa
    let penggunaMengikutiSidangValues = [emailMahasiswa, idSidang, "Mahasiswa"];
    await client.query(
      penggunaMengikutiSidangQuery,
      penggunaMengikutiSidangValues
    );

    // masukin dosen pembimbing utama
    penggunaMengikutiSidangValues = [
      emailPembimbingUtama,
      idSidang,
      "Pembimbing Utama",
    ];
    await client.query(
      penggunaMengikutiSidangQuery,
      penggunaMengikutiSidangValues
    );

    // masukin dosen pembimbing pendamping
    penggunaMengikutiSidangValues = [
      emailPembimbingPendamping,
      idSidang,
      "Pembimbing Pendamping",
    ];
    await client.query(
      penggunaMengikutiSidangQuery,
      penggunaMengikutiSidangValues
    );

    // masukin dosen penguji utama
    penggunaMengikutiSidangValues = [
      emailPengujiUtama,
      idSidang,
      "Penguji Utama",
    ];
    await client.query(
      penggunaMengikutiSidangQuery,
      penggunaMengikutiSidangValues
    );

    // masukin dosen penguji pendamping
    penggunaMengikutiSidangValues = [
      emailPengujiPendamping,
      idSidang,
      "Penguji Pendamping",
    ];
    await client.query(
      penggunaMengikutiSidangQuery,
      penggunaMengikutiSidangValues
    );

    // masukin koordinator
    // manual email bu mariskha
    penggunaMengikutiSidangValues = [
      "mariskha@unpar.ac.id",
      idSidang,
      "Koordinator",
    ];
    await client.query(
      penggunaMengikutiSidangQuery,
      penggunaMengikutiSidangValues
    );

    await client.query("COMMIT");
    return res.json({ success: true });
  } catch (error) {
    console.log(error);
    await client.query("ROLLBACK");

    throw new InternalServerError("An unexpected error occurred");
  } finally {
    client.release();
  }
};

// export const getMahasiswaNotHaveSidang = async (req, res) => {
//   const textQuery = `SELECT
//         p.nama AS "namaMahasiswa",
//         m.email AS "emailMahasiswa",
//         m.npm AS "npmMahasiswa"
//     FROM
//         Mahasiswa m
//     INNER JOIN
//         Pengguna p
//     ON
//         m.email = p.email
//     LEFT JOIN
//         PenggunaMengikutiSidang pms
//     ON
//         m.email = pms.email
//     WHERE
//         pms.idSidang IS null`;

//   const queryResult = await pool.query(textQuery);

//   return res.status(200).json(queryResult.rows);
// };
