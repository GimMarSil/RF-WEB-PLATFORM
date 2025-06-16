import type { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';

const sqlConfig = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER,
  database: process.env.SQL_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const upn = req.query.upn as string;
  if (!upn) return res.status(400).json({ message: 'Missing upn' });

  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`SELECT [Number] AS number, [Name] AS name FROM Employee WHERE UserId = ${upn} AND Active = 1`;
    res.status(200).json(result.recordset);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  } finally {
    sql.close();
  }
}
