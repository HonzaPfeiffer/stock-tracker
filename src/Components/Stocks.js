import React, { Component } from 'react'
import Stock from './Stock'
import DataError from './DataError'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import tokens from '../tokens.json'

class Stocks extends Component {
  constructor (props) {
    super(props)

    this.stockName = React.createRef() // Získá data z textboxu ve formuláři
    this.handleSubmit = this.handleSubmit.bind(this)
    this.clearStock = this.clearStock.bind(this)
    this.searchInstrument = this.searchInstrument.bind(this)
    this.renderStockOffer = this.renderStockOffer.bind(this)
    this.renderSavedStocks = this.renderSavedStocks.bind(this)
    this.addToSaved = this.addToSaved.bind(this)
    this.removeFromSaved = this.removeFromSaved.bind(this)
    this.saveValueToStorage = this.saveValueToStorage.bind(this)
    this.clearStock = this.clearStock.bind(this)

    let stockFromStorage = []

    const state = {
      stockOffer: [],
      showGraph: !!localStorage.getItem('stock'),
      savedStocks: !!localStorage.getItem('stocks'),
      error: null
    }

    try {
      if (state.showGraph) {
        stockFromStorage = localStorage.getItem('stock')
        stockFromStorage = JSON.parse(stockFromStorage)
        console.log(stockFromStorage)
      }
    } catch (error) {
      localStorage.removeItem('stock')
      console.log(error)
      state.showGraph = false
    }

    this.state = state // Koukne se jestli je v local storage parametr a když jo, tak nastaví na true a jinak false
  }

  handleSubmit (e) {
    e.preventDefault()
    this.searchInstrument(this.stockName.current.value)
  }

  async searchInstrument (query) {
    this.state.stockOffer = []

    try {
      const response = await fetch('https://alpha-vantage.p.rapidapi.com/query?keywords=' + query + '&function=SYMBOL_SEARCH&datatype=json', {
        method: 'GET',
        headers: {
          'x-rapidapi-key': tokens.search_token,
          'x-rapidapi-host': 'alpha-vantage.p.rapidapi.com'
        }
      })
      const json = await response.json()
      if (!response.ok) {
        this.setState({ error: 'WS is broken or there is too many requests. Wait please one minute and then reload page.' })
      } else {
        const arr = [json]

        const arrayOfInstruments = []
        for (const instrument of arr[0].bestMatches) {
          const transformedInstrument = []
          transformedInstrument.push(instrument['1. symbol']) // Symbol
          transformedInstrument.push(instrument['2. name']) // Název
          transformedInstrument.push(instrument['4. region']) // Region
          transformedInstrument.push(instrument['5. marketOpen']) // Otevření trhu
          transformedInstrument.push(instrument['6. marketClose']) // Zavření trhu
          transformedInstrument.push(instrument['7. timezone']) // Timezone
          arrayOfInstruments.push(transformedInstrument)
        }
        this.setState({ stockOffer: arrayOfInstruments })
      }
    } catch (error) {
      console.log(error)
      this.setState({ error: error })
      alert(error)
    }
  }

  renderStockOffer () {
    const instruments = []

    for (let index = 0; index < this.state.stockOffer.length; index++) {
      const instrument = this.state.stockOffer[index]
      // let formulation = <li key={index}><a onClick = {(e) => {this.saveValueToStorage(e, index)}} >{instrument[1]} - {instrument[2]}</a></li>;
      const formulation = <button key={index} type="button" className="list-group-item list-group-item-action" onClick={(e) => { this.addToSaved(e, index) }} >{instrument[1]} - {instrument[2]}</button>
      instruments.push(formulation)
    }
    return instruments
  }

  addToSaved (event, index) {
    let savedStocks = []

    if (this.state.savedStocks) {
      savedStocks = localStorage.getItem('stocks')
      savedStocks = JSON.parse(savedStocks)
      console.log(savedStocks)
    }
    savedStocks.push(this.state.stockOffer[index])
    localStorage.setItem('stocks', JSON.stringify(savedStocks))
    console.log(localStorage.getItem('stocks'))
    this.setState({ savedStocks: true, stockOffer: [] })
  }

  removeFromSaved (event, index) {
    let savedStocks = []
    if (this.state.savedStocks) {
      savedStocks = localStorage.getItem('stocks')
      savedStocks = JSON.parse(savedStocks)
      // delete savedStocks[index];
      savedStocks.splice(index, 1)
    }
    localStorage.setItem('stocks', JSON.stringify(savedStocks))
    console.log(localStorage.getItem('stocks'))

    if (typeof savedStocks !== 'undefined' && savedStocks.length > 0) {
      this.setState({ savedStocks: true })
    } else {
      this.setState({ savedStocks: false })
    }
  }

  renderSavedStocks () {
    const stockCards = []

    if (this.state.savedStocks) {
      let savedStocks = localStorage.getItem('stocks')
      try {
        savedStocks = JSON.parse(savedStocks)
      } catch (error) {
        console.log(error)
      }

      for (let index = 0; index < savedStocks.length; index++) {
        let stockName = savedStocks[index][1].split(' ')[0]
        stockName = stockName.toLowerCase()
        const stockLogoUrl = '//logo.clearbit.com/' + stockName + '.com'

        const formulation = (
          <div className="card bg-dark text-white mb-3 col-6" key={index}>
            <div className="card-header">
              <div className="row">
                <img id="stock-logo" src={stockLogoUrl} alt={stockName} />
                <p>{savedStocks[index][0]} - {savedStocks[index][1]}</p>
              </div>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col">
                  <button type="button" className="btn btn-primary" onClick={(e) => { this.saveValueToStorage(e, index) }}>Detail</button>
                </div>
                <div className="col">
                  <button type="button" className="btn btn-danger" onClick={(e) => { this.removeFromSaved(e, index) }}><FontAwesomeIcon icon={faTrash} /></button>
                </div>
              </div>
            </div>
          </div>
        )
        stockCards.push(formulation)
      }
    }

    return stockCards
  }

  saveValueToStorage (event, index) {
    let savedStocks = localStorage.getItem('stocks')
    savedStocks = JSON.parse(savedStocks)

    localStorage.setItem('stock', JSON.stringify(savedStocks[index]))
    console.log(localStorage.getItem('stock'))
    this.setState({ showGraph: true })
  }

  clearStock () {
    this.setState({ showGraph: false })
    localStorage.removeItem('stock')
  }

  render () {
    if (this.state.error != null) {
      return <DataError errorMessage={this.state.error} />
    } else {
      return (
        <div>
          {
            this.state.showGraph
              ? <Stock onClear={this.clearStock} />
              : <>
                <h2>Stocks</h2>
                <form onSubmit={this.handleSubmit}>
                  <div className="row">
                    <div className="col">
                      <input id="text" className="form-control" type="text" ref={this.stockName} placeholder="Find your investment" />
                      <div className="list-group">
                        {this.renderStockOffer()}
                      </div><br></br>
                      {this.renderSavedStocks()}
                    </div>
                    <div className="col-sm-1">
                      <button type="submit" name="Submit" className="btn btn-primary">Search</button>
                    </div>
                  </div>
                </form>
              </>
          }
        </div>
      )
    }
  }
}

export default Stocks
