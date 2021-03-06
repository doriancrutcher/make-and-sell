import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Container, Row } from "react-bootstrap";
import { async } from "@firebase/util";
import { Col } from "react-bootstrap";
import { Card } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { BN } from "bn.js";
import getConfig from "../assets/js/near/config";
import { transactions } from "near-api-js";
import { Alert } from "react-bootstrap";

const Home = (props) => {
  const [productsNames, changeProductsNames] = useState([]);
  const [imageSelect, changeImageSelect] = useState([]);
  const [prices, changePrices] = useState([]);
  const [ownersList, changeOwnersList] = useState([]);
  const [disable, changeDisabled] = useState(false);
  const [buyLimit, changeBuyLimit] = useState(false);

  // useEffect(() => {
  //   const buyLimit = async () => {
  //     let ownedStuff = await contract.get_product_by_owner({
  //       name: window.accountId,
  //     });

  //     if (ownedStuff.length > 3) {
  //       changeBuyLimit(true);
  //       changeDisabled(true);
  //     }
  //   };
  //   buyItem();
  // }, []);

  useEffect(() => {
    const getProductInfo = async () => {
      let imageArray = imageSelect;
      let currentOwners = ownersList;
      let getAllProducts = await contract.get_name_vector();
      changeProductsNames(getAllProducts);
      let imageResults = getAllProducts.map(async (el) => {
        return await window.contract.get_product({ name: el });
      });
      let priceResults = getAllProducts.map(async (el) => {
        console.log(el);
        currentOwners.push(
          await window.contract.get_token_owner({ token_id: el })
        );

        return await window.contract.get_product_price({ name: el });
      });

      changeImageSelect(await Promise.all(imageResults));
      changePrices(await Promise.all(priceResults));
      changeOwnersList(currentOwners);
    };
    getProductInfo();
  }, []);

  const buyItem = async (name, index) => {
    changeDisabled(true);

    await window.contract
      .remove_item(
        {
          name: name,
          price: prices[index],
          index: index,
          owner: window.accountId,
        },
        "300000000000000",
        window.utils.format.parseNearAmount(prices[index])
      )
      .then(
        alert(
          `You bought ${name}! Please refresh page and checked out the owned section`
        )
      );
  };

  return (
    <React.Fragment>
      {buyLimit ? (
        <Alert>
          Thanks for shopping! For the Workshop you have bought the max number
          of drawings. This is done to give everyone the chance to get one :D
        </Alert>
      ) : null}
      {imageSelect.map((el, i) => {
        console.log(imageSelect);
        return (
          <Row
            style={{ marginTop: "10vh" }}
            key={i}
            className='justify-content-center d-flex'
          >
            <Card style={{ width: "40vw" }}>
              <Card.Title>{productsNames[i]}</Card.Title>{" "}
              <Row className='justify-content-center d-flex'>
                {" "}
                <img style={{ height: "50vh" }} src={el} />
              </Row>
              <Card.Text>Price: {prices[i]} NEAR Tokens</Card.Text>
              <Row style={{ marginTop: "3vh" }}>
                <Button
                  disabled={disable}
                  onClick={async () => {
                    await buyItem(productsNames[i], i);
                  }}
                >
                  Purchase
                </Button>
              </Row>
            </Card>
          </Row>
        );
      })}
    </React.Fragment>
  );
};

export default Home;
