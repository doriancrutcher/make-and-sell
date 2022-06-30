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

const Home = (props) => {
  const [productsNames, changeProductsNames] = useState([]);
  const [imageSelect, changeImageSelect] = useState([]);
  const [prices, changePrices] = useState([]);
  const [ownersList, changeOwnersList] = useState([]);
  const [disable, changeDisabled] = useState(false);

  useEffect(() => {
    const getProductInfo = async () => {
      let imageArray = imageSelect;
      let currentOwners = ownersList;
      let getAllProducts = await contract.get_name_vector();
      changeProductsNames(getAllProducts);
      imageResults = getAllProducts.map(async (el) => {
        return await window.contract.get_product({ name: el });
      });
      priceResults = getAllProducts.map(async (el) => {
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
    // const nearConfig = getConfig(process.env.NODE_ENV || "development");

    // let removeItemsArgs = { name: name, price: prices[index], index: index };
    // let mintArgs = {
    //   token_id: `${window.accountId}-go-team-poke`,
    //   metadata: {
    //     title: "My Non Fungible Team Token",
    //     description: "The Team Most Certainly Goes :)",
    //     media:
    //       "https://simg.nicepng.com/png/small/6-67471_1-reply-20-retweets-87-likes-machoke-nsfw.png",
    //   },
    //   receiver_id: window.accountId,
    // };

    // await account.signAndSendTransaction({
    //   receiver_id: nearConfig.contractName,
    //   actions: [
    //     transactions.functionCall(
    //       "remove_item",
    //       Buffer.from(JSON.stringify(removeItemsArgs)),
    //       10000000000000,
    //       10000000000000
    //     ),
    //     transactions.functionCall(
    //       "nft_mint",
    //       Buffer.from(JSON.stringify(mintArgs)),
    //       10000000000000,
    //       10000000000000
    //     ),
    //   ],
    // });

    if (
      await contract.check_token({ id: `${window.accountId}-go-team-poke` })
    ) {
      await window.contract.remove_item(
        {
          name: name,
          price: prices[index],
          index: index,
          owner: window.accountId,
        },
        "300000000000000",
        window.utils.format.parseNearAmount(prices[index])
      );
    } else {
      await window.contract.remove_item(
        {
          name: name,
          price: prices[index],
          index: index,
          owner: window.accountId,
        },
        "300000000000000"
        // window.utils.format.parseNearAmount(prices[index])
      );
    }
  };

  return (
    <React.Fragment>
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
                <img style={{ width: "50vw" }} src={el} />
              </Row>
              <Card.Text>Artist: {ownersList[i]}</Card.Text>
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
