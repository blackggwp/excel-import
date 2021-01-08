var express = require('express');
var router = express.Router();
const sql = require('mssql')

// const mssqlConfig = 'mssql://sa:88888888pP@192.168.0.251/test'

const mssqlConfig = {
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
    let pool = await sql.connect(mssqlConfig)
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
  await sql.connect(mssqlConfig)
  let body = []
  body = req.body
  let excels = []
  let rows = {}
  let results = {}
  if (body.importExcel) {
    body = body.files
    const isSuccess = await loopData(responseStatus)
    if (isSuccess) {
      responseStatus(res)
    }
  } else {
    res.sendStatus(400)
  }

  async function loopData(_callback) {
    for (const sheets of body) {
      for (const key in sheets) {
        if (sheets.hasOwnProperty(key)) {
          for (i = 0; i < sheets[key].length - 1; i++) {
            sheets[key][0].forEach((colName, j) => {
              rows[colName] = sheets[key][i + 1][j]
            })
            excels.push(rows)
            try {
              const status = await insertDB(rows, Object.keys(sheets), res)
              // console.log(status)
              if (status) {
                return _callback(res, status)
              }
            } catch (err) {
              return _callback(res, err)
            }
            rows = {}
          }
        }
      }
    }
    return true
  }

  function responseStatus(res, err) {
    if (!err) {
      res.statusMessage = JSON.stringify(results)
      res.sendStatus(200)
      return
    } else {
      res.statusMessage = err
      res.sendStatus(400).end()
      return
    }
  }

  async function getColName() {
    const result = await sql.query`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
    WHERE (TABLE_NAME = 'T_Outlet_Foodx')`
    const colNameT = result.recordset
    let colName = []
    colNameT.forEach(col => {
      colName.push(col.COLUMN_NAME)
    })
    return colName
  }

  async function insertDB(rows, db_name) {
    const colName = await getColName()
    const vals = mapColWithVal(colName, rows)
    try {
      let statement = `insert into ${db_name}.dbo.T_Outlet_Foodx 
      (${joinCols(colName)}) values (${joinVal(vals)})`
      let pool = await sql.connect(mssqlConfig)
      let result1 = await pool.request().query(statement)
      results[db_name] = (results[db_name] + parseInt(result1.rowsAffected)) || parseInt(result1.rowsAffected);
      // console.dir(result1)
    } catch (err) {
      // console.error(err)
      return ` ${err} DBName: ${db_name} `
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

})

module.exports = router;
