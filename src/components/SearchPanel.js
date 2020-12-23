import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import Select from 'react-select'

const style = {
  margin: '40px',
  display: 'block',
  justifyContent: 'center',
  alignItem: 'center',
  width: 400,
  height: 40,
  textAlign: 'center'
};

export default function SearchPanel() {
  const [invs, setInvs] = useState('')
  const [hasErrors, setHasIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedValue, setSelectedValue] = useState();

  useEffect(() => {
    const fetchData = async () => {
      setHasIsError(false);
      setIsLoading(true);

      try {
        const result = await Axios.get(`/excel/inv?q=${query}`)
        const res = await result.data
        const invs = res.map(inv => {
          return { value: inv.scinvoice, label: inv.scinvoice }
        })
        setInvs(invs)
      } catch (error) {
        setHasIsError(true);
        console.error(error)
      }
      setIsLoading(false);
    };

    fetchData();
  }, [query])

  const handleInputChange = (inputValue) => {
    if (inputValue.length >= 3) {
      setQuery(inputValue)
    }
  }

  const handleInputSelected = (e) => {
    setSelectedValue(e.value)
  }

  return (
    <section>
      <div style={style}>
        {isLoading && <p>loading...</p>}
        {hasErrors && <p>Something went wrong.</p>}
        <Select
          className="basic-single"
          classNamePrefix="select"
          isLoading={isLoading}
          isClearable={true}
          isSearchable={true}
          name="invoice"
          options={invs}
          onInputChange={handleInputChange}
          onChange={handleInputSelected}
        />
      </div>
    </section>
  )
}
