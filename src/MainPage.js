import React, { Component } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom'
import Header from './Components/Header'
import Home from './Components/Home'
import Stocks from './Components/Stocks'

class MainPage extends Component {
  render () {
    const year = new Date().getFullYear() // Aktuální rok pro Copyright :)
    return (
        <Router>
          <Header/>
          <main className="container">
            <section id="content">
              <br></br>
              <Routes>
                <Route exact path="/" element={<Home />} />
                <Route path="/stocks" element={<Stocks />} />
              </Routes>
            </section>
          </main>
          <footer>
            <small>&copy; Copyright {year}, Jan Pfeiffer</small>
          </footer>
        </Router>
    )
  }
}

export default MainPage
