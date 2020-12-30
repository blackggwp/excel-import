import React, { useMemo, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import UploadFile from './UploadFile';

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#000',
  outline: 'none',
  transition: 'border .24s ease-in-out',
  fontFamily: 'Kanit',
  fontWeight: 700,
  cursor: 'pointer'
};

const activeStyle = {
  borderColor: '#2196f3'
};

const acceptStyle = {
  borderColor: '#00e676'
};

const rejectStyle = {
  borderColor: '#ff1744'
};

const thumbsContainer = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginTop: 16
};

const thumb = {
  display: 'inline-flex',
  borderRadius: 2,
  border: '1px solid #eaeaea',
  marginBottom: 8,
  marginRight: 8,
  width: 100,
  height: 100,
  padding: 4,
  boxSizing: 'border-box'
};

const thumbInner = {
  display: 'flex',
  minWidth: 0,
  overflow: 'hidden'
};

const img = {
  display: 'block',
  width: 'auto',
  height: '100%'
};

export default function StyledDropzone() {
  const [files, setFiles] = useState([])
  const [isFiles, setIsFiles] = useState(false)
  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    onDrop: (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file)
          }),
        )
      )
    }
  });

  const style = useMemo(() => ({
    ...baseStyle,
    ...(isDragActive ? activeStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [
    isDragActive,
    isDragReject,
    isDragAccept
  ]);

  const acceptedFileItems = acceptedFiles.map(file => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  const thumbs = files.map(file => (
    <div style={thumb} key={file.name}>
      <div style={thumbInner}>
        <img
          // src={file.preview}
          src={process.env.PUBLIC_URL + '/logo192.png'}
          style={img}
        />
      </div>
    </div>
  ));

  useEffect(() => {
    if (files.length !== 0) {
      setIsFiles(true)
    }
    return () => {
      setIsFiles(false)
    }
  }, [files])

  return (
    <div className="container" style={{ padding: 20 }}>
      <div {...getRootProps({ style })}>

        <div className="jumbotron jumbotron-fluid">
          <div className="container">
            <h1 className="display-3">Import excel file here.</h1>
            <hr className="my-2" />
            <p>Drag 'n' drop some files here, or click to select files</p>
            <em>(Only *.xlsx will be accepted)</em>
          </div>
          <input {...getInputProps()} />
        </div>
      </div>

      <aside style={thumbsContainer}>
        {thumbs}
        <ul>{acceptedFileItems}</ul>
        {isFiles && <UploadFile uploadedFile={files} />}
      </aside>
    </div>

  );
}

<StyledDropzone />
