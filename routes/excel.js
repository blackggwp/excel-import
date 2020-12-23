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

router.get('/inv', async function (req, res, next) {
  const inv_num = String(req.query.q)
  try {
    let pool = await sqlsrv.connect(mssqlConfig)
    let result = await pool.request()
      .input('input_parameter', '%' + inv_num + '%')
      .query('SELECT TOP(5) * FROM  tinvoice WHERE (scinvoice LIKE @input_parameter )')
    // console.dir(result)
    res.send(result.recordsets[0]);

  } catch (error) {
    console.error(error);
    res.sendStatus(504)
  }
})

router.get('/pdf', async function (req, res, next) {
  const fs = require('fs');
  const pdf = require('pdf-parse');

  let dataBuffer = fs.readFileSync('X:\\backup\\1.pdf');

  pdf(dataBuffer).then(function (data) {

    // number of pages
    console.log(data.numpages);
    // number of rendered pages
    console.log(data.numrender);
    // PDF info
    console.log(data.info);
    // PDF metadata
    console.log(data.metadata);
    // PDF.js version
    // check https://mozilla.github.io/pdf.js/getting_started/
    console.log(data.version);
    // PDF text
    console.log(data.text);
    res.send(data)

  });
})

router.post('/import', async function (req, res, next) {
  var isSuccess = true
  await sqlsrv.connect(mssqlConfig)
  const ps = new sqlsrv.PreparedStatement()
  // const result = await sqlsrv.query`
  let body = req.body

  let excels = []
  let rows = {}
  // map col with value
  if (body) {
    body.forEach((sheets, i) => {
      for (var key in sheets) {
        if (sheets.hasOwnProperty(key)) {
          // console.log(key + " : " + sheets[key]);
          for (i = 0; i < sheets[key].length - 1; i++) {
            sheets[key][0].forEach((colName, j) => {
              rows[colName] = sheets[key][i + 1][j]
            })
            excels.push(rows)
            exec2(rows, Object.keys(sheets), res)
            rows = {}
          }
        }
      }
    })
    return res.sendStatus(200)
  }

  async function getColName() {
    const result = await sqlsrv.query`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
    WHERE (TABLE_NAME = 'T_Outlet_Foodx')`
    const colNameT = result.recordset
    let colName = []
    colNameT.forEach(col => {
      colName.push(col.COLUMN_NAME)
    })
    return colName
  }

  async function exec2(rows, db_name, res) {
    const colName = await getColName()
    const vals = mapColWithVal(colName, rows)
    try {
      const transaction = new sqlsrv.Transaction(/* [pool] */)
      transaction.begin(async (err) => {
        // ... error checks
        const request = new sqlsrv.Request(transaction)
        // console.log(`insert into ${db_name}.dbo.T_Outlet_Foodx 
        // (${joinCols(colName)}) values (${joinVal(vals)})`
        // )
        request.query(`insert into ${db_name}.dbo.T_Outlet_Foodx 
        (${joinCols(colName)}) values (${joinVal(vals)})`, (err, result) => {
          // ... error checks
          if (err) {
            isSuccess = false
            console.error(err)
            res.status(400).send(err);
          }
          transaction.commit(err => {
            // ... error checks
          })
        })
      })
    } catch (error) {
      console.error(error);
      res.sendStatus(504)
    }
  }

  function mapColWithVal(cols, vals) {
    let res = []
    cols.forEach(col => {
      res.push(vals[col])
    })
    return res
  }

  function joinCols(array) {
    return array.join().split(",").map(i => i).join()
  }
  function joinVal(array) {
    // return array.join().split(",").map(i => '\'' + i + '\'').join()
    return array.map(i => '\'' + i + '\'').join()
  }
  async function exec(cols, vals, db_name, res) {
    try {
      const transaction = new sqlsrv.Transaction(/* [pool] */)
      transaction.begin(err => {
        // ... error checks
        const request = new sqlsrv.Request(transaction)
        request.query(`insert into ${db_name}.dbo.T_Outlet_Foodx (${joinCols(cols)}) values (${joinVal(vals)})`, (err, result) => {
          // ... error checks
          // console.log(err)
          transaction.commit(err => {
            // ... error checks
            if (!result || (result === undefined)) {
              isSuccess = false
              res.sendStatus(400)
              // res.status(400).json({
              //   status: 'error',
              //   error: 'cannot insert data to db',
              // })
              return
            } else {
              return res.status(200)
            }
          })
        })
      })
    } catch (error) {
      console.error(error);
      res.sendStatus(504)
    }
  }
  // for (const sheet in body) {
  //   for (db_name in body[sheet]) {
  //     const cols = body[sheet][db_name][0]
  //     let row = body[sheet][db_name]
  //     row.shift()
  //     row.forEach(async element => {
  //       exec(cols, element, db_name, res)
  //     });
  //   }
  // }
})

module.exports = router;
