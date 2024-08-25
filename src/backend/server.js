const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  user: "test",
  password: "psw",
  connectString: "localhost:1521/orcl"
};

app.post('/signup', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    
    const { username, name, email, password } = req.body;
    const role = 'undefined';

    const result = await connection.execute(
      `INSERT INTO Utilisateur (User_Name, Name, Email, Password, Role) 
       VALUES (:username, :name, :email, :password, :role)`,
      { username, name, email, password, role },
      { autoCommit: true }
    );

    res.json({ message: 'User created successfully', rowsAffected: result.rowsAffected });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while creating the user' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

app.post('/login', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    
    const { username, password } = req.body;

    const result = await connection.execute(
      `SELECT Role FROM Utilisateur WHERE User_Name = :username AND Password = :password`,
      { username, password }
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Incorrect username or password' });
    } else {
      const role = result.rows[0][0];
      if (role === 'undefined') {
        res.json({ message: 'Wait for role attribution' });
      } else {
        res.json({ message: 'Login successful', role });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred during login' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));