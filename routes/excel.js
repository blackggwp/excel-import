var express = require('express');
var router = express.Router();

const sqlsrv = require('mssql')
let mssqlConfig = {
  user: "sa",
  password: "admin1234",
  server: "localhost",
  database: "test",
  "options": {
    encrypt: true,
    "enableArithAbort": true
  },
};

router.post('/import', async function (req, res, next) {
  var isSuccess = true
  await sqlsrv.connect(mssqlConfig)
  const ps = new sqlsrv.PreparedStatement()
  // const result = await sqlsrv.query`
  let body = req.body
  // console.log(body)
  function joinCols(array) {
    return array.join().split(",").map(i => i).join()
  }
  function joinVal(array) {
    console.log(array)
    return array.join().split(",").map(i => '\'' + i + '\'').join()
  }
  async function exec(cols, vals, db_name, res) {
    try {
      const transaction = new sqlsrv.Transaction(/* [pool] */)
      transaction.begin(err => {
        // ... error checks
        // console.error(err)
        const request = new sqlsrv.Request(transaction)
        request.query(`insert into ${db_name}.dbo.T_Outlet_Foodx (${joinCols(cols)}) values (${joinVal(vals)})`, (err, result) => {
          // ... error checks
          // console.error(err)
          transaction.commit(err => {
            // ... error checks
            if (!result) {
              isSuccess = false
              return res.status(400).json({
                status: 'error',
                error: 'cannot insert data to db',
              });
            } else {
              return res.send.json({ status: 'success' })
            }
          })
        })
      })
    } catch (error) {
      console.error(error);
      res.sendStatus(504)
    }
  }
  for (const sheet in body) {
    for (db_name in body[sheet]) {
      const cols = body[sheet][db_name][0]
      let row = body[sheet][db_name]
      row.shift()
      row.forEach(async element => {
        exec(cols, element, db_name, res)
      });
    }
  }
})

module.exports = router;
