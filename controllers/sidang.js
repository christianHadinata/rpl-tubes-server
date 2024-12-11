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
      CAST(s.idSidang AS INT) AS "idSidang",
      s.judulSkripsi AS "judulSkripsi",
      mhs.nama AS "namaMahasiswa",
      m.npm,
      pembimbing_utama.nama AS "namaPembimbingUtama",
      pembimbing_pendamping.nama AS "namaPembimbingPendamping",
      ketua_penguji.nama AS "namaKetuaTimPenguji",
      anggota_penguji.nama AS "namaAnggotaTimPenguji",
      s.TA,
      s.tahunAjaran AS "tahunAjaran",
      TO_CHAR(s.tanggal, 'YYYY-MM-DD') AS "tanggal",
      s.jamMulai AS "jamMulai",
      s.jamSelesai AS "jamSelesai",
      s.tempat
	
  FROM 
      Sidang s
  LEFT JOIN 
      PenggunaMengikutiSidang pms_mhs 
  ON 
      s.idSidang = pms_mhs.idSidang AND pms_mhs.role = 'Mahasiswa'
  LEFT JOIN 
      Pengguna mhs 
  ON 
      pms_mhs.email = mhs.email
  LEFT JOIN 
      Mahasiswa m 
  ON 
      mhs.email = m.email
  LEFT JOIN 
      PenggunaMengikutiSidang pms_pembimbing_utama 
  ON 
      s.idSidang = pms_pembimbing_utama.idSidang AND pms_pembimbing_utama.role = 'Pembimbing Utama'
  LEFT JOIN 
      Pengguna pembimbing_utama 
  ON 
      pms_pembimbing_utama.email = pembimbing_utama.email
  LEFT JOIN 
      PenggunaMengikutiSidang pms_pembimbing_pendamping 
  ON 
      s.idSidang = pms_pembimbing_pendamping.idSidang AND pms_pembimbing_pendamping.role = 'Pembimbing Pendamping'
  LEFT JOIN 
      Pengguna pembimbing_pendamping 
  ON 
      pms_pembimbing_pendamping.email = pembimbing_pendamping.email
  LEFT JOIN 
      PenggunaMengikutiSidang pms_ketua_penguji 
  ON 
      s.idSidang = pms_ketua_penguji.idSidang AND pms_ketua_penguji.role = 'Ketua Tim Penguji'
  LEFT JOIN 
      Pengguna ketua_penguji 
  ON 
      pms_ketua_penguji.email = ketua_penguji.email
  LEFT JOIN 
      PenggunaMengikutiSidang pms_anggota_penguji 
  ON 
      s.idSidang = pms_anggota_penguji.idSidang AND pms_anggota_penguji.role = 'Anggota Tim Penguji'
  LEFT JOIN 
      Pengguna anggota_penguji 
  ON 
      pms_anggota_penguji.email = anggota_penguji.email
  WHERE 
      s.idSidang = $1;
  `;

  const values = [idSidang];

  const queryResult = await pool.query(textQuery, values);

  return res.status(200).json(queryResult.rows[0]);
};

export const getCatatanSidang = async (req, res) => {
  const { idSidang } = req.query;
  const idSidangInt = parseInt(idSidang);

  const textQueryGetCatatanSidang = `
  SELECT
      isiCatatan AS "isiCatatan"
  FROM
      Sidang
  WHERE
      idSidang = $1;
  `;

  const valuesGetCatatanSidang = [idSidangInt];
  const queryResult = await pool.query(
    textQueryGetCatatanSidang,
    valuesGetCatatanSidang
  );

  return res.status(200).json(queryResult.rows[0].isiCatatan);
};

export const updateCatatanSidang = async (req, res) => {
  const { isiCatatan, idSidang } = req.body;
  const idSidangInt = parseInt(idSidang);

  const textQueryUpdateCatatanSidang = `
  UPDATE
      Sidang
  SET
      isiCatatan = $1
  WHERE
      idSidang = $2
  `;

  const valuesUpdateCatatanSidang = [isiCatatan, idSidangInt];

  const queryResult = await pool.query(
    textQueryUpdateCatatanSidang,
    valuesUpdateCatatanSidang
  );

  return res.status(200).json(queryResult.rows);
};

export const updateJadwalDanTempatSidang = async (req, res) => {
  const { tanggal, tempat, jamMulai, jamSelesai, idSidang } = req.body;

  const idSidangInt = parseInt(idSidang);

  const textQueryUpdateJadwalDanTempatSidang = `
  UPDATE
      Sidang
  SET
      tanggal = $1,
      tempat = $2,
      jamMulai = $3,
      jamSelesai = $4
  WHERE
      idSidang = $5;
  `;

  const valuesUpdateJadwalDanTempatSidang = [
    tanggal,
    tempat,
    jamMulai,
    jamSelesai,
    idSidangInt,
  ];

  await pool.query(
    textQueryUpdateJadwalDanTempatSidang,
    valuesUpdateJadwalDanTempatSidang
  );

  return res.json({ success: true });
};

export const getAllKomponenRole = async (req, res) => {
  const { roleDosen, idSidang } = req.query;
  const idSidangInt = parseInt(idSidang);

  const textQueryAllKomponenRole = `
  SELECT
      CAST(kn.idKomponen AS INT) AS "idKomponen",
      kn.namaKomponen AS "namaKomponen",
      kn.role AS "role",
      CAST(kn.bobot AS FLOAT) AS "bobot",
      CAST(n.nilaiDiberi AS FLOAT) AS "nilai"
  FROM
      KomponenNilai kn
  LEFT JOIN 
      Nilai n 
  ON 
      kn.idKomponen = n.idKomponen AND n.idSidang = $1
  WHERE
      kn.role = $2 AND kn.isActive = TRUE;
  `;

  const valuesAllKomponenRole = [idSidangInt, roleDosen];

  const queryResult = await pool.query(
    textQueryAllKomponenRole,
    valuesAllKomponenRole
  );

  return res.status(200).json(queryResult.rows);
};

export const getBAPSidang = async (req, res) => {
  const { idSidang } = req.query;
  const idSidangInt = parseInt(idSidang);

  const textQueryGetBAPSidang = `
  SELECT
      role,
      CAST (nilai AS FLOAT),
      CAST(persentase AS INT),
      CAST (nilaiAkhir AS FLOAT) AS "nilaiAkhir"
  FROM
      NilaiDiBAP
  WHERE
      idSidang = $1
  `;

  const valuesQueryGetBAPSidang = [idSidangInt];

  const queryResult = await pool.query(
    textQueryGetBAPSidang,
    valuesQueryGetBAPSidang
  );

  return res.status(200).json(queryResult.rows);
};

export const createTTDBAP = async (req, res) => {
  const { idSidang, role } = req.body;

  const textQueryCreateTTD = `
  INSERT INTO 
      TTD (idSidang, role, pathGambarTTD) 
  VALUES 
      ($1, $2, $3)`;
  const valuesQueryCreateTTD = [idSidang, role, req.file.filename];

  await pool.query(textQueryCreateTTD, valuesQueryCreateTTD);

  return res.status(200).json({ success: true });
};

export const getTTDBAP = async (req, res) => {
  const { idSidang } = req.query;
  const idSidangInt = parseInt(idSidang);

  const textQueryGetTTDBAPSidang = `
  SELECT
      CAST (idSidang AS INT) AS "idTTD",
      CAST (idSidang AS INT) AS "idSidang",
      role,
      pathGambarTTD AS "pathGambarTTD"
  FROM
      TTD
  WHERE
      idSidang = $1
  `;

  const valuesQueryGetTTDBAPSidang = [idSidangInt];

  const queryResult = await pool.query(
    textQueryGetTTDBAPSidang,
    valuesQueryGetTTDBAPSidang
  );

  return res.status(200).json(queryResult.rows);
};
