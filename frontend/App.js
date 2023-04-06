import "regenerator-runtime/runtime";
import React, { useState, useRef, useEffect } from "react";

import {
  login,
  logout,
  get_greeting,
  set_greeting,
} from "./assets/js/near/utils";
import getConfig from "./assets/js/near/config";

import "bootstrap/dist/css/bootstrap.min.css";

// bootstrap
import { Container, Row, Button } from "react-bootstrap";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";

//components
import UpoadImage from "./Components/UpoadImage";
import Home from "./Components/Home";
import AltHome from "./Components/AltHome";

//react router

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Routes,
} from "react-router-dom";
import { useEffect } from "react";
import Owned from "./Components/Owned";
import { Alert } from "react-bootstrap";
import { Col } from "react-bootstrap";

export default function App() {
  const [images, setImages] = React.useState([]);
  const [altHome, changeAltHome] = React.useState(<AltHome />);

  const onChange = (imageList, addUpdateIndex) => {
    // data for submit
    console.log(imageList, addUpdateIndex);
    setImages(imageList);
  };

  useEffect(() => {
    const getInfo = async () => {
      let getList = await window.contract.get_name_vector();
      getList.length === 0 ? null : changeAltHome(false);
    };
    getInfo();
  }, []);
  return (
    <Router>
      <Navbar collapseOnSelect expand='lg' bg='dark' variant='dark'>
        <Container>
          <Navbar.Brand href='/'>Make-And-Sell</Navbar.Brand>
          <Navbar.Toggle aria-controls='responsive-navbar-nav' />
          <Navbar.Collapse id='responsive-navbar-nav'>
            <Nav title='Menu' className='me-auto'>
              <Nav.Item>
                <Link to='/newproduct' className='nav-link'>
                  Add Item
                </Link>
              </Nav.Item>

              <Nav.Item>
                <Link to='/' className='nav-link'>
                  Shop
                </Link>
              </Nav.Item>

              <Nav.Item>
                <Link to='/owned' className='nav-link'>
                  Owned
                </Link>
              </Nav.Item>
            </Nav>

            <Nav>
              <Button
                onClick={window.walletConnection.isSignedIn() ? logout : login}
              >
                {window.walletConnection.isSignedIn()
                  ? window.accountId
                  : "Login"}
              </Button>{" "}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container>
        <Alert>
          Welcome to make and sell! Take an Ipad create your picture and upload
          a png to this marketplace and sell your NFT!{" "}
        </Alert>
      </Container>

      <Container>
        <Routes>
          <Route path='/' exact element={altHome ? <AltHome /> : <Home />} />
          <Route path='/newproduct' exact element={<UpoadImage />} />
          <Route path='/owned' exact element={<Owned />} />
        </Routes>
      </Container>
    </Router>
  );
}
