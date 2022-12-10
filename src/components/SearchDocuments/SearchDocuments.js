import React, {useState} from 'react';
import './SearchDocuments.css';
import {Card, CheckboxField, Flex, Heading, SearchField, SelectField} from "@aws-amplify/ui-react";
import {API} from "aws-amplify";

const SearchDocuments = () => {
    const [facetResults, setFacetResults] = useState([]);
    const [resultItems, setResultItems] = useState([]);
    let [searched, setSearched] = useState(false);
    let [queryString, setQueryString] = useState("");
    let [selectedFacets, setSelectedFacets] = useState([]);

    async function searchDocument(event, queryString, attributeFilter) {
        const response = await API.get('kendraSearch', '/search', {
            headers: {},
            response: true,
            queryStringParameters: {
                query: queryString,
                attributeFilter: JSON.stringify(attributeFilter)
            }
        });
        console.log(response)
        let facetResults = response.data.FacetResults;
        facetResults = facetResults.filter(item => item.DocumentAttributeKey !== 's3_document_id')
        const resultItems = response.data.ResultItems;
        console.log(resultItems)
        setResultItems(resultItems);
        setFacetResults(facetResults);
        setSearched(true);

        if (event === 'submit') {
            setFacets(facetResults);
        }
    }

    function setFacets(facetResults) {
        let selectedFacets = [];
        // facetResults.map(function (item) {
        //     const facetName = item.DocumentAttributeKey;
        //     item.DocumentAttributeValueCountPairs.map(function (countPair) {
        //         const facetKey = countPair.DocumentAttributeValue.StringValue;
        //         selectedFacets.push({facetKey: facetKey, facetName: facetName});
        //     })
        // });
        setSelectedFacets(selectedFacets);
    }

    function highLightText(content) {
        let startIndex = 0;

        // return <div className='oneline'>{content}</div>

        let spanText = content.Highlights.map(function (item, index) {
            const temp = (
                <span key={index}>
                    <span>{content.Text.substring(startIndex, item.BeginOffset)}</span>
                    <span><strong>{content.Text.substring(item.BeginOffset, item.EndOffset)}</strong></span>
                </span>
            )
            startIndex = item.EndOffset;
            return temp;
        })
        return <div className='oneline'>{spanText}{content.Text.substring(startIndex)}</div>
    }

    async function handleChecked(event) {
        const checked = event.target.checked;
        const facetKey = event.target.attributes.getNamedItem("name").value;
        const facetName = event.target.attributes.getNamedItem("data-attributekey").value;

        if (checked) {
            selectedFacets.push({facetKey: facetKey, facetName: facetName});
        } else {
            selectedFacets = selectedFacets.filter(facet => facet.facetKey !== facetKey);
        }

        const attributeFilter = {
            "OrAllFilters": []
        }

        selectedFacets.map(function (item) {
            const facetKey = item.facetKey;
            const facetName = item.facetName;

            attributeFilter.OrAllFilters.push({
                "EqualsTo": {
                    "Key": facetName,
                    "Value": {
                        "StringValue": facetKey
                    }
                }
            })
        })
        searchDocument("change", queryString, attributeFilter);
    }

    async function handleSort(event) {

    }

    return (
        <Flex
            direction={{base: 'column', large: 'column'}}
            padding="1rem"
            width="100%"
            style={{display: "block", margin: "10px auto"}}
        >
            <Heading level={4} style={{textAlign: "left"}}>Document Search</Heading>
            <Flex direction={{base: 'row', large: 'row'}}
                  padding="1rem"
                  width="60%"
                  style={{alignItems: "center", margin: "auto", display: "block"}}
            >
                <SearchField
                    label="Search"
                    placeholder="Search for Documents..."
                    size={"large"}
                    onSubmit={(value) => {
                        setQueryString(value);
                        searchDocument("submit", value, {"AndAllFilters": []});
                    }}
                />
            </Flex>
            {resultItems.length > 0 &&
                <Flex
                    direction={{base: 'row', large: 'row'}}>
                    <Flex
                        direction={{base: 'column', large: 'column'}}
                        padding="1rem">
                        <Heading level={6} style={{textAlign: "left"}}>Filter Results</Heading>
                        <ul className="result-list">
                            {facetResults.map(function (item, index) {
                                return <li key={index}>
                                    <span style={{
                                        fontWeight: "bold",
                                        display: "block",
                                        margin: "10px 0 10px 0"
                                    }}>{item.DocumentAttributeKey}</span>
                                    <ul className="result-list">
                                        {item.DocumentAttributeValueCountPairs.map(function (countPair, countPairIndex) {
                                            return <li key={countPairIndex}>
                                                <CheckboxField
                                                    data-attributekey={item.DocumentAttributeKey}
                                                    name={countPair.DocumentAttributeValue.StringValue}
                                                    value="yes"
                                                    onChange={(e) => handleChecked(e)}
                                                    label={countPair.DocumentAttributeValue.StringValue + " (" + countPair.Count + ")"}
                                                />
                                            </li>
                                        })}
                                    </ul>
                                </li>
                            })}
                        </ul>
                    </Flex>
                    <Flex
                        direction={{base: 'column', large: 'column'}}
                        padding="1rem"
                        style={{alignItems: "center", margin: "auto"}}>
                        <Flex
                            direction={{base: 'row'}} style={{width: "100%", alignItems: "center", justifyContent: "right"}}>
                            <span><strong>Sort</strong></span>
                            <SelectField name="department"
                                         labelHidden
                                         variation="quiet"
                                         defaultValue="relevance"
                                         onChange={(e) => handleSort()}
                            >
                                <option value="relevance">Relevance</option>
                                <option value="created_at">Created at</option>
                                <option value="title">Title</option>
                                <option value="_language_code">Language Code</option>
                                <option value="view_count">View Count</option>
                                <option value="_uploaded_by">Uploaded By</option>
                            </SelectField>
                        </Flex>
                        <ul className="result-list">
                            {resultItems.map(function (item, index) {
                                return <li key={index}>
                                    <Card className="custom-card">
                                        <Flex
                                            direction={{base: 'column', large: 'column'}}
                                            padding="1rem"
                                            style={{display: "block", margin: "10px auto", textAlign: "left"}}
                                        >
                                            <a rel="noreferrer" target="_blank"
                                               href={item.PreSignedURL}>{item.DocumentTitle.Text}</a>
                                            <div>{highLightText(item.DocumentExcerpt)}</div>
                                        </Flex>
                                    </Card>
                                </li>;
                            })}
                        </ul>
                    </Flex>
                </Flex>
            }
            {
                (searched && resultItems.length <= 0) && <span>No Results</span>
            }
        </Flex>
    );
};
export default SearchDocuments;