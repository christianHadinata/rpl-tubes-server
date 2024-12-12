import pool from "../db/db.js";

export const getNPM = async (req, res) => {
  const { email } = req.query;

  const textQueryGetNPM = `
  SELECT
      npm
  FROM
      Mahasiswa m
  WHERE
      m.email = $1
  `;

  const valuesGetNPM = [email];
  const queryResult = await pool.query(textQueryGetNPM, valuesGetNPM);

  return res.status(200).json(queryResult.rows[0].npm);
};

export const getAllNilai = async (req, res) => {
  const { npm } = req.query;
  const npmInt = parseInt(npm);

  const textQueryGetAllNilai = `
  SELECT
      s.judulSkripsi AS "judulSkripsi",
      m.npm,
      s.ta,
      CAST(SUM(nbp.persentase) AS INT) AS "totalPersentase",
      SUM(nbp.nilaiAkhir) AS "totalNilaiAkhir"
  FROM
      Sidang s
  INNER JOIN
      PenggunaMengikutiSidang pms
  ON
      s.idSidang = pms.idSidang
  INNER JOIN
      Mahasiswa m
  ON
      pms.email = m.email
  INNER JOIN
      NilaiDiBAP nbp
  ON
      nbp.idSidang = s.idSidang
  WHERE
      m.npm = $1
  GROUP BY
      s.idSidang,
      m.npm
  `;

  const valuesGetAllNilai = [npmInt];
  const queryResult = await pool.query(textQueryGetAllNilai, valuesGetAllNilai);

  return res.status(200).json(queryResult.rows);
};
