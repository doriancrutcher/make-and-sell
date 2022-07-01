import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { Fade } from "react-bootstrap";
import { storage, storageRef } from "../firebase";
import { Button } from "react-bootstrap";
import { Card } from "react-bootstrap";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";

import { Form } from "react-bootstrap";

const UpoadImage = (props) => {
  const productRef = useRef();
  const priceRef = useRef();
  const tokenRef = useRef();
  const [image, setImage] = useState(null);
  const [disabled, changeDisabled] = useState(false);

  let metadata;

  const handleChange = (event) => {
    console.log(priceRef.current.value);
    if (event.target.files[0]) {
      setImage(event.target.files[0]);
      metadata = {
        contentType: event.target.files[0].type,
      };
    }
  };
  console.log(storage);
  console.log(ref(storage), "images");
  console.log(image);

  const handleUpload = (e) => {
    changeDisabled(true);
    e.preventDefault();
    // const uploadTask = ref(storage, `images/${image.name}`).put
    // uploadTask.on(
    //   "state_changed",
    //   (snapshot) => {},
    //   (error) => {
    //     console.log(error);
    //   },
    //   () => {
    //     storage
    //       .ref("images")
    //       .child(image.name)
    //       .getDownloadURL()
    //       .then((url) => {
    //         console.log(url);
    //       });
    //   }
    // );

    const storageRef = ref(storage, `images/${image.name}`);

    const uploadTask = uploadBytesResumable(storageRef, image, metadata);

    uploadBytes(storageRef).then((snapshot) => {
      console.log("Uploaded a blob or file!");
      getDownloadURL(storageRef).then(async (downloadURL) => {
        console.log("File availiable at", downloadURL);
        console.log("price is", priceRef.current.value);
        await window.contract
          .add_product({
            product_name: `${window.accountId}-${productRef.current.value}`,
            url: downloadURL,
            price: priceRef.current.value,
          })
          .then(async () => {
            await window.contract.nft_mint(
              {
                token_id: `${window.accountId}-${productRef.current.value}`,
                metadata: {
                  title: "My Non Fungible Team Token",
                  description: "The Team Most Certainly Goes :)",
                  media: downloadURL,
                },
                receiver_id: window.accountId,
              },
              300000000000000, // attached GAS (optional)
              window.utils.format.parseNearAmount("1")
            );
          })
          .then(() => {
            alert("Go to shopping page by clicking the logo or shop");
          });
      });

      //   console.log(snapshot.metadata.);
    });
  };
  return (
    <Card style={{ width: "80vh" }}>
      <Card.Body>
        <Form>
          <Form.Group className='mb-3'>
            <Form.Label>Product Name</Form.Label>
            <Form.Control ref={productRef} placeholder='Product Name' />
          </Form.Group>
          <Form.Group className='mb-3'>
            <Form.Label>Product Name</Form.Label>
            <Form.Control type='file' onChange={handleChange} />
            <Form.Text className='text-muted'></Form.Text>
          </Form.Group>
          <Form.Group className='mb-3' controlId='formBasicEmail'>
            <Form.Label>NEAR Token Price</Form.Label>
            <Form.Control ref={priceRef} placeholder='Add token price' />
          </Form.Group>

          <Button onClick={handleUpload} disabled={disabled} type='submit'>
            Submit
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

UpoadImage.propTypes = {};

export default UpoadImage;
