import { BadRequestError } from "../errors/BadRequestError.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import bcrypt from "bcryptjs";
import pool from "../db/db.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  const { email, nama, password, role, npm } = req.body;

  if (!email || !nama || !password || !role) {
    throw new BadRequestError("All specified field must be included");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const textQuery = `INSERT INTO Pengguna (email, nama, password, role) VALUES ($1, $2, $3, $4)`;
  const values = [email, nama, hashedPassword, role];
  await pool.query(textQuery, values);

  if (npm) {
    const textQuery = `INSERT INTO Mahasiswa (email, npm) VALUES ($1, $2)`;
    const values = [email, npm];
    await pool.query(textQuery, values);
  }

  return res.status(200).json({ success: true });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Semua Field Harus Diisi!");
  }

  const textQuery = `SELECT email, nama, password, role FROM Pengguna WHERE email = $1`;

  const queryResult = await pool.query(textQuery, [email]);

  if (queryResult.rowCount === 0) {
    throw new UnauthorizedError("Email Belum Terdaftar!");
  }

  const user = queryResult.rows[0];
  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new UnauthorizedError(
      "Password yang Anda Masukan Salah. Silakan Coba Lagi!"
    );
  }

  const token = jwt.sign(
    { email: user.email, nama: user.nama, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );

  return res.status(200).json({ success: true, token });
};

export const getRoleUserInSidang = async (idSidang, email) => {
  const idSidangInt = parseInt(idSidang);

  const textQueryGetRoleUserInSidang = `
  SELECT
      pms.role
  FROM
      PenggunaMengikutiSidang pms
  WHERE
      idSidang = $1 AND email = $2
  `;

  const valuesGetRoleUserInSidang = [idSidangInt, email];

  const queryResult = await pool.query(
    textQueryGetRoleUserInSidang,
    valuesGetRoleUserInSidang
  );

  return queryResult.rows[0]?.role || null;
};