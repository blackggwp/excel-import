import Axios from 'axios';
import React, { useEffect, useState } from 'react';
import readXlsxFile from 'read-excel-file'

const style = {
  margin: '40px',
  display: 'block',
  justifyContent: 'center',
  alignItem: 'center',
  width: 400,
  height: 40,
  textAlign: 'center'
};

export default function UploadFile() {
  const [listSheets, setListSheets] = useState([])
  const [sheets, setSheets] = useState([])
  const [files, setFiles] = useState([])
  const [isSend, setIsSend] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleChange = (e) => {
    const filesT = e.target.files[0]
    readXlsxFile(filesT, { getSheets: true }).then((sheets) => {
      setListSheets(sheets)
    })
    setSheets(filesT)
  }

  const proceed = () => {
    let itemsProcessed = 0;
    listSheets.forEach(sheet => {
      readXlsxFile(sheets, { sheet: sheet.name }).then((rows) => {
        setFiles(files => [...files, { [sheet.name]: rows }]);
        // setFiles({ [sheet.name]: rows });

        itemsProcessed++
        if (itemsProcessed === listSheets.length) {
          setIsSend(true)
        }
      })
    });
  }
  useEffect(() => {
    const send = async () => {
      try {
        const result = await Axios.post('/excel/import', files)
        // const res = await result.data
        console.log(result)
        // setInvs(invs)
      } catch (error) {
        setHasError(error.response.data.error)
        console.error(error)
      }
    }
    if (isSend) send()
    return function cleanup() {
      setIsSend(false)
      setFiles([])
    }
  }, [isSend])

  return (
    <div style={style}>
      <input type="file" className="form-control" id="file"
        accept={['.xlsx']} onChange={handleChange} />
      <input type="submit" onClick={proceed} value="upload" />
    </div>
  )
}