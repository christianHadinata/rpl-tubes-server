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
    emailPengujiUtama,
    emailPengujiPendamping,
  } = req.body;

  let { emailPembimbingPendamping } = req.body;

  if (emailPembimbingPendamping === "") {
    emailPembimbingPendamping = "-";
  }

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
WHERE
    kn.isActive = TRUE
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
    INSERT INTO
        PersentaseNilai(role, persentase)
    VALUES
        ($1, $2)
    ON CONFLICT
        (role)
    DO
      UPDATE
      SET
        persentase = $2
      WHERE
        PersentaseNilai.role = $1
    `;

    const valuesPersentase = [selectedRole, persentaseNilai];

    await client.query(textQueryPersentase, valuesPersentase);

    // di komponenNilai isActive nya jadiin false dulu yg dulu
    const textQueryUpdateIsActive = `
    UPDATE
      KomponenNilai
    SET
      isActive = FALSE
    WHERE
      role = $1
    `;

    const valuesUpdateIsActive = [selectedRole];

    await client.query(textQueryUpdateIsActive, valuesUpdateIsActive);

    // Masukin yg baru ke tabel KomponenNilai

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
        arrBobotKomponen[i] / 100,
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

export const createNilai = async (req, res) => {
  const { idSidang, nilai } = req.body;
  const idSidangInt = parseInt(idSidang);
  const nilaiFloat = parseFloat(nilai);

  const client = await pool.connect();

  // ambil idKomponen koordinator
  const textQueryGetKomponen = `
  SELECT
      kn.idKomponen AS "idKomponen"
  FROM
      KomponenNilai kn
  WHERE
      kn.role = 'Koordinator' AND isActive = TRUE;
  `;
  const queryResultKomponen = await pool.query(textQueryGetKomponen);
  const idKomponen = queryResultKomponen.rows[0].idKomponen;

  // cek dulu udah ada nilai belum
  const textQueryGetNilai = `
  SELECT
      idKomponen AS "idKomponen"
  FROM
      Nilai
  WHERE
      idKomponen = $1 AND idSidang = $2;
  `;

  const valuesGetNilai = [idKomponen, idSidangInt];

  const queryResultGetNilai = await pool.query(
    textQueryGetNilai,
    valuesGetNilai
  );

  const isNilaiExist = queryResultGetNilai.rows.length !== 0 ? true : false;

  console.log("Nilai exist:");
  console.log(isNilaiExist);

  try {
    await client.query("BEGIN");
    // kalau belum ada nilai ya tinggal tambah
    if (!isNilaiExist) {
      const textQueryAddNilai = `
      INSERT INTO 
          Nilai(idKomponen, idSidang, nilaiDiberi)
      VALUES 
          ($1, $2, $3);
      `;

      const valuesAddNilai = [idKomponen, idSidangInt, nilaiFloat];

      await client.query(textQueryAddNilai, valuesAddNilai);

      // terus hitung nilai kali bobotKomponen
      const textQueryGetNilai = `
      SELECT 
          SUM(Nilai.nilaiDiberi * KomponenNilai.bobot) AS "totalNilai"
      FROM 
          Nilai
      INNER JOIN 
          KomponenNilai 
      ON 
          Nilai.idKomponen = KomponenNilai.idKomponen
      WHERE
          Nilai.idKomponen = $1 AND Nilai.idSidang = $2;
      `;

      const valuesGetNilai = [idKomponen, idSidangInt];

      const queryResultGetNilai = await client.query(
        textQueryGetNilai,
        valuesGetNilai
      );

      const nilaiKaliBobot = queryResultGetNilai.rows[0].totalNilai;

      // terus ambil persentase nilai koordinator

      const textQueryPersentaseNilai = `
      SELECT 
          persentase
      FROM
          PersentaseNilai
      WHERE
          role = 'Koordinator'
      `;

      const queryResultPersentaseNilai = await client.query(
        textQueryPersentaseNilai
      );

      const persentase = queryResultPersentaseNilai.rows[0].persentase;

      // hitung nilaiAkhir
      const nilaiAkhir = (nilaiKaliBobot * persentase) / 100;

      // bikin row NilaiDiBAP

      const textQueryAddNilaiDiBAP = `
      INSERT INTO
          NilaiDiBAP(idSidang, role, persentase, nilai, nilaiAkhir)
      VALUES
          ($1, $2, $3, $4, $5);
      `;

      const valuesAddNilaiDiBAP = [
        idSidangInt,
        "Koordinator",
        persentase,
        nilaiKaliBobot,
        nilaiAkhir,
      ];

      await client.query(textQueryAddNilaiDiBAP, valuesAddNilaiDiBAP);
    } else {
      // kalau udah ada nilai, di update
      const textQueryUpdateNilai = `
      UPDATE 
          Nilai
      SET
          nilaiDiberi = $1
      WHERE
          idKomponen = $2 AND idSidang = $3
      `;

      const valuesUpdateNilai = [nilaiFloat, idKomponen, idSidangInt];

      await client.query(textQueryUpdateNilai, valuesUpdateNilai);

      // terus hitung nilai kali bobotKomponen
      const textQueryGetNilai = `
      SELECT 
          SUM(Nilai.nilaiDiberi * KomponenNilai.bobot) AS "totalNilai"
      FROM 
          Nilai
      INNER JOIN 
          KomponenNilai 
      ON 
          Nilai.idKomponen = KomponenNilai.idKomponen
      WHERE
          Nilai.idKomponen = $1 AND Nilai.idSidang = $2;
      `;

      const valuesGetNilai = [idKomponen, idSidangInt];

      const queryResultGetNilai = await client.query(
        textQueryGetNilai,
        valuesGetNilai
      );

      const nilaiKaliBobot = queryResultGetNilai.rows[0].totalNilai;

      // terus ambil persentase nilai koordinator

      const textQueryPersentaseNilai = `
      SELECT 
          persentase
      FROM
          NilaiDiBAP
      WHERE
          idSidang = $1 AND role = $2
      `;

      const valuesQueryPersentaseNilai = [idSidangInt, "Koordinator"];

      const queryResultPersentaseNilai = await client.query(
        textQueryPersentaseNilai,
        valuesQueryPersentaseNilai
      );

      const persentase = queryResultPersentaseNilai.rows[0].persentase;

      // hitung nilaiAkhir
      const nilaiAkhir = (nilaiKaliBobot * persentase) / 100;

      // update row NilaiDiBAP

      const textQueryAddNilaiDiBAP = `
      UPDATE
          NilaiDiBAP
      SET
          nilai = $1,
          nilaiAkhir = $2
      WHERE
          idSidang = $3 AND role = $4
      `;

      const valuesAddNilaiDiBAP = [
        nilaiKaliBobot,
        nilaiAkhir,
        idSidangInt,
        "Koordinator",
      ];

      await client.query(textQueryAddNilaiDiBAP, valuesAddNilaiDiBAP);
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
