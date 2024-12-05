import pool from "../db/db.js";

export const getAllDosen = async (req, res) => {
  const textQuery = 
    `SELECT 
        p.email AS "emailDosen",
        p.nama AS "namaDosen"
    FROM 
        Pengguna AS p
    WHERE
        p.role != 'Mahasiswa'`;

  const queryResult = await pool.query(textQuery);

  return res.status(200).json(queryResult.rows);
};