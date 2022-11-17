import React, {useState} from 'react';
import './SearchDocuments.css';
import {Card, Flex, Heading, SearchField, Text} from "@aws-amplify/ui-react";
import {API} from "aws-amplify";

const SearchDocuments = () => {
    const [resultItems, setResultItems] = useState([]);

    async function searchDocument(value) {
        const response = await API.get('searchKendra', '/search', {
            headers: {},
            response: true,
            queryStringParameters: {
                query: value
            }
        });
        const resultItems = response.data.ResultItems;
        console.log(resultItems);
        setResultItems(resultItems);
    }

    return (
        <Flex
            direction={{base: 'column', large: 'column'}}
            padding="1rem"
            width="90%"
            style={{display: "block", margin: "10px auto"}}
        >
            <Heading level={3} style={{textAlign: "left"}}>Document Search</Heading>
            <Flex direction={{base: 'row', large: 'row'}}
                  padding="1rem"
                  width="60%"
                  style={{alignItems: "center", margin: "auto", display: "block"}}
            >
                <SearchField
                    label="Search"
                    placeholder="Search for Documents..."
                    size={"large"}
                    onSubmit={(value) => searchDocument(value)}
                />
            </Flex>
            <Flex
                direction={{base: 'column', large: 'column'}}
                padding="1rem"
                style={{alignItems: "center", margin: "auto", display: "block"}}>
                <ul className="result-list">
                    {resultItems.map(function (item, index) {
                        return <li key={index}>
                            <Card className="custom-card">
                                <Flex
                                    direction={{base: 'column', large: 'column'}}
                                    padding="1rem"
                                    style={{display: "block", margin: "10px auto", textAlign: "left"}}
                                >
                                    <a href={item.DocumentURI}>{item.DocumentTitle.Text}</a>
                                    <Text>{item.DocumentExcerpt.Text}</Text>
                                </Flex>
                            </Card>
                        </li>;
                    })}
                </ul>
            </Flex>
        </Flex>
    );
};
export default SearchDocuments;