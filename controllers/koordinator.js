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
      "Ketua Tim Penguji",
    ];
    await client.query(
      penggunaMengikutiSidangQuery,
      penggunaMengikutiSidangValues
    );

    // masukin dosen penguji pendamping
    penggunaMengikutiSidangValues = [
      emailPengujiPendamping,
      idSidang,
      "Anggota Tim Penguji",
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

export const getKomponenDanBobot = async (req, res) => {
  const textQuery = `
    SELECT 
    pn.role,
    CAST(COUNT(kn.idKomponen) AS INT) AS jumlahKomponen,
    pn.persentase
FROM 
    PersentaseNilai pn
LEFT JOIN 
    KomponenNilai kn
ON 
    pn.role = kn.role
GROUP BY 
    pn.role, pn.persentase`;

  const queryResult = await pool.query(textQuery);

  return res.status(200).json(queryResult.rows);
};

export const createKomponenDanBobot = async (req, res) => {
  const {
    selectedRole,
    banyakKomponen,
    persentaseNilai,
    arrNamaKomponen,
    arrBobotKomponen,
  } = req.body;

  console.log({
    selectedRole,
    banyakKomponen,
    persentaseNilai,
    arrNamaKomponen,
    arrBobotKomponen,
  });

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // update dulu persentase di tabel PersentaseNilai
    const textQueryPersentase = `
    UPDATE
      PersentaseNilai pn
    SET
      persentase = $1
    WHERE
      pn.role = $2
    `;

    const valuesPersentase = [persentaseNilai, selectedRole];

    await client.query(textQueryPersentase, valuesPersentase);

    // Masukin ke tabel KomponenNilai

    const textQueryKomponenNilai = `
    INSERT INTO
      KomponenNilai(namaKomponen, role, bobot)
    VALUES
      ($1, $2, $3)
    `;

    for (let i = 0; i < banyakKomponen; i++) {
      const valuesKomponenNilai = [
        arrNamaKomponen[i],
        selectedRole,
        arrBobotKomponen[i],
      ];

      await client.query(textQueryKomponenNilai, valuesKomponenNilai);
    }

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
