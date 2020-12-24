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
  textAlign: 'center',
  fontFamily: 'Kanit'
};

export default function UploadFile(props) {
  const [listSheets, setListSheets] = useState([])
  const [sheets, setSheets] = useState([])
  const [files, setFiles] = useState([])
  const [isSend, setIsSend] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errMessage, setErrMessage] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (file) => {
    // const filesT = e.target.files[0]
    const filesT = file[0]
    readXlsxFile(filesT, { getSheets: true }).then((sheets) => {
      setListSheets(sheets)
    })
    setSheets(filesT)
  }

  const proceed = (e) => {
    e.preventDefault();
    let itemsProcessed = 0;
    listSheets.forEach(sheet => {
      readXlsxFile(sheets, { sheet: sheet.name }).then((rows) => {

        setFiles(files => [...files, { [sheet.name]: rows }]);

        itemsProcessed++
        if (itemsProcessed === listSheets.length) {
          setIsSend(true)
        }
      })

    });
  }
  useEffect(() => {
    const send = async () => {
      setIsLoading(true)
      try {
        const result = await Axios.post('/excel/import', files)
        console.log(result)
        setHasError(false)
        setErrMessage(false)
        setIsSuccess(true)
        setIsLoading(false)
        setErrMessage(false)
      } catch (error) {
        setIsLoading(false)
        setHasError(error)
        setIsSuccess(false)
        console.error(error)
        setErrMessage('Data Invalid Please check excel or contact IT DEV.')
      }
    }
    if (isSend) send()
    return function cleanup() {
      setIsSend(false)
      setFiles([])
    }
  }, [isSend])

  useEffect(() => {
    if (props.uploadedFile) {
      handleChange(props.uploadedFile)
    }
  }, [props.uploadedFile])

  return (
    <div style={style}>
      {isLoading ? <img src={process.env.PUBLIC_URL + '/loading.gif'} style={{
        display: 'block',
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '50%'
      }} /> :
        <input type="submit" onClick={proceed} value="upload"
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            textAlign: 'center',
            height: '100%',
            margin: '0 auto',
            letterSpacing: '0.1em',
            cursor: 'pointer',
            fontStyle: 'Kanit',
            fontSize: 14,
            fontWeight: 400,
            lineHeight: 45,
            maxWidth: 160,
            position: 'relative',
            textDecoration: 'none',
            textTransform: 'uppercase',
            width: '100%'
          }}
        />}
      {errMessage && !isLoading && <h3 style={{ backgroundColor: 'red' }}>{errMessage}</h3>}
      {isSuccess && !isLoading && <h3 style={{ backgroundColor: 'green' }}>Import data success.</h3>}
    </div>
  )
}
