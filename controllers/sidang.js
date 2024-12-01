export const getListUserSidangAll = async (req, res) => {
  const { email, role } = req.body;

  const textQuery = `
  SELECT 
    s.idSidang,
    s.judulSkripsi,
    s.TA,
    m.nama AS namaMahasiswa,
    mhs.npm,
    p_dosen.email AS emailDosen,
    pms_dosen.role AS roleDosen
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
    Pengguna p_dosen ON pms_dosen.email = p_dosen.email`;

  if (role === "Mahasiswa") {
    textQuery += `
    WHERE 
      m.email = $1
      AND pms_dosen.role != 'Mahasiswa'
    ORDER BY 
      s.idSidang `;
  } else {
    textQuery += `
    WHERE 
      p_dosen.email = $1
      AND pms_mahasiswa.role = 'Mahasiswa'
    ORDER BY 
      s.idSidang `;
  }

  const values = [email];
  const queryResult = await pool.query(textQuery, values);

  return res.status(200).json(queryResult.rows);
};
