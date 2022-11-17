import React from "react";
import "./Home.css";
import "@aws-amplify/ui-react/styles.css";
import {
    Card, Flex, Heading, Text,
    View,
} from '@aws-amplify/ui-react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faDiagramProject, faSearch, faUpload} from '@fortawesome/free-solid-svg-icons'
import {Link} from "react-router-dom";
import bgVideo from "../../assets/GettyImages-483749109.mp4";

const Home = () => {
    return (
        <View className="Home">
            <Flex direction={{base: 'row', large: 'row'}} className="video-container">
                <video className="video-bg" playsInline={true} autoPlay={true} muted={true} loop={true} id="bgvid">
                    <source src={bgVideo}></source>
                </video>
                <div className="intro">
                    <Heading level={1} className="heading">Artifact Store</Heading>
                    <span className="short-desc">At last, this is what you have been searching for.</span>
                    <span className="short-desc">Powerful search engine build on machine learning capabilities to provide you the contextual results you are searching for. </span>
                </div>
            </Flex>
            <Flex
                direction={{base: 'row', large: 'row'}}
                width="70%"
                style={{alignItems: "center", padding: "40px", margin: "0 auto", justifyContent: "space-between"}}
            >
                <Link to="/uploadFiles">
                    <Card borderRadius="medium"
                          variation="outlined">
                        <FontAwesomeIcon icon={faUpload} size="2x" color="#22577A"/>
                        <Heading level={5}>Upload Files</Heading>
                        <Text>Lorem ipsum dolum</Text>
                    </Card>
                </Link>
                <Link to="/searchDocs">
                    <Card borderRadius="medium"
                          maxWidth="20rem"
                          variation="outlined">
                        <FontAwesomeIcon icon={faSearch} size="2x" color="#22577A"/>
                        <Heading level={5}>Search Documents</Heading>
                        <Text>Lorem ipsum dolum</Text>
                    </Card>
                </Link>
                <Link to="/searchEntities">
                    <Card borderRadius="medium"
                          maxWidth="20rem"
                          variation="outlined">
                        <FontAwesomeIcon icon={faDiagramProject} size="2x" color="#22577A"/>
                        <Heading level={5}>Search Entities</Heading>
                        <Text>Lorem ipsum dolum</Text>
                    </Card>
                </Link>
            </Flex>
        </View>
    );
};

export default Home;