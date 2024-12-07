import pool from "../db/db.js";

export const getListUserSidangAll = async (req, res) => {
  const { email, role } = req.query;
  console.log(email, role);

  let textQuery = "";

  if (role !== "Mahasiswa") {
    textQuery = `
  SELECT 
      s.idSidang AS "idSidang",
      s.judulSkripsi AS "judulSkripsi",
      s.TA AS "TA",
      s.tahunAjaran AS "tahunAjaran",
      m.nama AS "namaMahasiswa",
      mhs.npm AS "npm",
      p_dosen.email AS "emailDosen",
      pms_dosen.role AS "roleDosen"
  FROM 
      Sidang s
  JOIN 
      PenggunaMengikutiSidang pms_mahasiswa ON s.idSidang = pms_mahasiswa.idSidang
  JOIN 
      Mahasiswa mhs ON pms_mahasiswa.email = mhs.email
  JOIN 
      Pengguna m ON mhs.email = m.email
  JOIN 
      PenggunaMengikutiSidang pms_dosen ON s.idSidang = pms_dosen.idSidang
  JOIN 
      Pengguna p_dosen ON pms_dosen.email = p_dosen.email
  WHERE 
      p_dosen.email = $1
      AND pms_mahasiswa.role = 'Mahasiswa'
      ORDER BY 
      s.idSidang `;
  } else {
    textQuery = `
  SELECT 
      s.idSidang AS "idSidang",
      s.judulSkripsi AS "judulSkripsi",
      s.TA AS "TA",
      s.tahunAjaran AS "tahunAjaran",
      m.nama AS "namaMahasiswa",
      mhs.npm AS "npm"
  FROM 
      Sidang s
  JOIN 
      PenggunaMengikutiSidang pms_mahasiswa ON s.idSidang = pms_mahasiswa.idSidang
  JOIN 
      Mahasiswa mhs ON pms_mahasiswa.email = mhs.email
  JOIN 
      Pengguna m ON mhs.email = m.email
  WHERE 
      m.email = $1
      ORDER BY 
        s.idSidang`;
  }

  const values = [email];

  const queryResult = await pool.query(textQuery, values);
  console.log(queryResult);
  console.log("Hello");

  return res.status(200).json(queryResult.rows);
};

export const getSingleSidang = async (req, res) => {
  const { idSidang } = req.query;
  const textQuery = `
  SELECT
    CAST(idSidang AS INT) AS "idSidang",
    judulSkripsi AS "judulSkripsi"
  FROM
    Sidang
  WHERE
    idSidang = $1
  `;

  const values = [idSidang];

  const queryResult = await pool.query(textQuery, values);

  return res.status(200).json(queryResult.rows[0]);
};
