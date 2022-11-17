import React from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import {
  Flex, Heading,
  View,
  withAuthenticator,
} from '@aws-amplify/ui-react';

import UploadFiles from "./components/UploadFiles/UploadFiles";
import {BrowserRouter, Link, Route, Routes} from "react-router-dom";
import SearchDocuments from "./components/SearchDocuments/SearchDocuments";
import Home from "./components/Home/Home";
import logoUrl from "./assets/logo.PNG";
import GraphSearch from "./components/GraphSearch/GraphSearch";

const App = ({signOut}) => {

  return (
      <View className="App">
        {/*<Header/>*/}
        <BrowserRouter>
          <Flex direction="column" width="100%" padding="5px 10px" style={{borderBottom: "1px solid lightgrey", boxShadow: "0 4px 5px lightgrey"}}>
            <Flex
                direction={{base: 'row', large: 'row'}}
                width="100%"
                style={{alignItems: "center"}}
            >
              <img className="Logo" src={logoUrl} alt="AnyCompany"/>
              <Heading level={4} style={{flexGrow: 3, textAlign: "right"}}>Artifact Store</Heading>

            </Flex>
            <Flex
                direction={{base: 'row', large: 'row'}}
                width="100%"
                style={{alignItems: "center", margin: "0 auto"}}
            >
              <Link className="Navbar-Item" to="/">Home</Link>
              <Link className="Navbar-Item" to="/uploadFiles">Upload Files</Link>
              <Link className="Navbar-Item" to="/searchDocs">Search Documents</Link>
              <Link className="Navbar-Item" to="/searchEntities">Find Entities</Link>
            </Flex>
          </Flex>
          <Routes>
            <Route exact path="/" element={<Home/>}/>
            <Route exact path="/searchDocs" element={<SearchDocuments/>}/>
            <Route exact path="/uploadFiles" element={<UploadFiles/>}/>
            <Route exact path="/searchEntities" element={<GraphSearch/>}/>
          </Routes>
        </BrowserRouter>
        {/*<Home/>*/}
        {/*<UploadFiles/>*/}
      </View>
  );
};

export default withAuthenticator(App);