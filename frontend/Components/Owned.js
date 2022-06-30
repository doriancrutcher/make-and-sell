import React from "react";
import PropTypes from "prop-types";
import { Container } from "react-bootstrap";
import { Row } from "react-bootstrap";
import { useState } from "react";
import { useEffect } from "react";
import { Alert } from "react-bootstrap";
import { Card } from "react-bootstrap";

const Owned = (props) => {
  const [ownedProducts, changeOwnedProducts] = useState([]);
  const [imageSelect, changeImageSelect] = useState([]);

  useEffect(() => {
    const getInfo = async () => {
      let ownedStuff = await contract.get_product_by_owner({
        name: window.accountId,
      });

      console.log(ownedStuff);
      changeOwnedProducts(ownedStuff);

      imageResults = ownedStuff.map(async (el) => {
        return await window.contract.get_product({ name: el });
      });
      changeImageSelect(await Promise.all(imageResults));
    };
    getInfo();
  }, []);

  return (
    <Container>
      {ownedProducts.length === 0 ? (
        <Row>
          <Alert>You own nothing </Alert>
        </Row>
      ) : (
        ownedProducts.map((el, i) => {
          return (
            <Row className='justify-content-center d-flex'>
              <Card style={{ width: "60vw" }}>
                <Card.Title>{el}</Card.Title>{" "}
                <Row className='justify-content-center d-flex'>
                  {" "}
                  <img style={{ width: "50vw" }} src={imageSelect[i]} />
                </Row>
              </Card>
            </Row>
          );
        })
      )}
    </Container>
  );
};

Owned.propTypes = {};

export default Owned;
