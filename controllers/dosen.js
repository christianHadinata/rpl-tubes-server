import pool from "../db/db.js";

export const getAllDosen = async (req, res) => {
  const textQuery = `SELECT 
        p.email AS "emailDosen",
        p.nama AS "namaDosen"
    FROM 
        Pengguna AS p
    WHERE
        p.role != 'Mahasiswa'`;

  const queryResult = await pool.query(textQuery);

  return res.status(200).json(queryResult.rows);
};

export const createNilai = async (req, res) => {
  const { idSidang, roleDosen, arrKomponenDanNilai } = req.body;

  console.log("idSidang: " + idSidang);
  console.log("roleDosen: " + roleDosen);
  console.log("arrKomponenDanNilai: " + arrKomponenDanNilai);

  const idSidangInt = parseInt(idSidang);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let nilaiKaliBobot = 0;

    for (const komponenDanNilai of arrKomponenDanNilai) {
      // insert atau update tabel Nilai
      const textQueryAddNilai = `
      INSERT INTO
          Nilai(idKomponen, idSidang, nilaiDiberi)
      VALUES
          ($1, $2, $3)
      ON CONFLICT
          (idKomponen, idSidang)
      DO
          UPDATE SET nilaiDiberi = $4
      WHERE
          Nilai.idKomponen = $5 AND Nilai.idSidang = $6
      `;

      const valuesAddNilai = [
        komponenDanNilai.idKomponen,
        idSidangInt,
        komponenDanNilai.nilai,
        komponenDanNilai.nilai,
        komponenDanNilai.idKomponen,
        idSidangInt,
      ];

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

      const valuesGetNilai = [komponenDanNilai.idKomponen, idSidangInt];
      console.log("idKomponen: " + komponenDanNilai.idKomponen);

      const queryResultGetNilai = await client.query(
        textQueryGetNilai,
        valuesGetNilai
      );

      const currNilaiKaliBobot = queryResultGetNilai.rows[0].totalNilai;

      console.log("currNilai: " + currNilaiKaliBobot);

      nilaiKaliBobot += currNilaiKaliBobot;
    }

    // await Promise.all(
    //   arrKomponenDanNilai.map(async (komponenDanNilai) => {
    //     // insert atau update tabel Nilai
    //     const textQueryAddNilai = `
    //   INSERT INTO
    //       Nilai(idKomponen, idSidang, nilaiDiberi)
    //   VALUES
    //       ($1, $2, $3)
    //   ON CONFLICT
    //       (idKomponen, idSidang)
    //   DO
    //       UPDATE SET nilaiDiberi = $4
    //   WHERE
    //       Nilai.idKomponen = $5 AND Nilai.idSidang = $6
    //   `;

    //     const valuesAddNilai = [
    //       komponenDanNilai.idKomponen,
    //       idSidangInt,
    //       komponenDanNilai.nilai,
    //       komponenDanNilai.nilai,
    //       komponenDanNilai.idKomponen,
    //       idSidangInt,
    //     ];

    //     await client.query(textQueryAddNilai, valuesAddNilai);

    //     // terus hitung nilai kali bobotKomponen
    //     const textQueryGetNilai = `
    //   SELECT
    //       SUM(Nilai.nilaiDiberi * KomponenNilai.bobot) AS "totalNilai"
    //   FROM
    //       Nilai
    //   INNER JOIN
    //       KomponenNilai
    //   ON
    //       Nilai.idKomponen = KomponenNilai.idKomponen
    //   WHERE
    //       Nilai.idKomponen = $1 AND Nilai.idSidang = $2;
    //   `;

    //     const valuesGetNilai = [komponenDanNilai.idKomponen, idSidangInt];
    //     console.log("idKomponen: " + komponenDanNilai.idKomponen);

    //     const queryResultGetNilai = await client.query(
    //       textQueryGetNilai,
    //       valuesGetNilai
    //     );

    //     const currNilaiKaliBobot = queryResultGetNilai.rows[0].totalNilai;

    //     console.log("currNilai: " + currNilaiKaliBobot);

    //     nilaiKaliBobot += currNilaiKaliBobot;
    //   })
    // );

    console.log(nilaiKaliBobot);

    let persentase = 0;

    // cek dulu udah pernah bikin bap belum, kalau udah berarti presentase nya pake yg di bap (snapshot)
    const textQueryPersentaseBAP = `
    SELECT
        persentase
    FROM
        NilaiDiBAP
    WHERE
        idSidang = $1 AND role = $2
    `;

    const valuesPersentaseBAP = [idSidangInt, roleDosen];

    const queryResultPersentaseBAP = await client.query(
      textQueryPersentaseBAP,
      valuesPersentaseBAP
    );

    if (queryResultPersentaseBAP.rows.length !== 0) {
      persentase = queryResultPersentaseBAP.rows[0].persentase;
    } else {
      // berarti belum ada BAP, ambil persentase nilai dosen dari tabel PersentaseNilai
      const textQueryPersentaseNilai = `
      SELECT
          persentase
      FROM
          PersentaseNilai
      WHERE
          role = $1
      `;

      const valuesPersentaseNilai = [roleDosen];
      const queryResultPersentaseNilai = await client.query(
        textQueryPersentaseNilai,
        valuesPersentaseNilai
      );

      persentase = queryResultPersentaseNilai.rows[0].persentase;
    }

    // hitung nilaiAkhir
    const nilaiAkhir = (nilaiKaliBobot * persentase) / 100;

    // bikin row NilaiDiBAP

    const textQueryAddNilaiDiBAP = `
    INSERT INTO
        NilaiDiBAP(idSidang, role, persentase, nilai, nilaiAkhir)
    VALUES
        ($1, $2, $3, $4, $5)
    ON CONFLICT
        (idSidang, role)
    DO
    UPDATE 
    SET 
      nilai = $6,
      nilaiAkhir = $7
    `;

    const valuesAddNilaiDiBAP = [
      idSidangInt,
      roleDosen,
      persentase,
      nilaiKaliBobot,
      nilaiAkhir,
      nilaiKaliBobot,
      nilaiAkhir,
    ];

    await client.query(textQueryAddNilaiDiBAP, valuesAddNilaiDiBAP);

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
