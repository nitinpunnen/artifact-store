import React, {useState, useEffect} from "react";
import "./UploadFiles.css";
import "@aws-amplify/ui-react/styles.css";
import {API, Storage} from 'aws-amplify';
import {
    Button, CheckboxField,
    Flex,
    Heading, SelectField,
    Table, TableBody, TableCell, TableHead, TableRow,
    TextField,
    View,
} from '@aws-amplify/ui-react';
import {listArtifacts} from "../../graphql/queries";
import {
    createArtifact as createArtifactMutation,
    deleteArtifact as deleteArtifactMutation,
} from "../../graphql/mutations"

const UploadFiles = () => {
    const [artifacts, setArtifacts] = useState([]);
    const [files, setFiles] = useState([]);

    useEffect(() => {
        fetchArtifacts();
    }, []);

    // useEffect(() => {
    // }, [files])

    async function fetchArtifacts() {
        const apiData = await API.graphql({query: listArtifacts});
        const artifacts = apiData.data.listArtifacts.items;
        await Promise.all(
            artifacts.map(async (artifact) => {
                if (artifact.fileName) {
                    const url = await Storage.get(artifact.name);
                    artifact.fileUrl = url;
                }
                return artifact;
            })
        );
        artifacts.sort((a, b) => {
            if (a.department > b.department) {
                return 1
            }
            if (a.department < b.department) {
                return -1
            }
            return 0;
        });
        setArtifacts(artifacts);
    }

    async function uploadFiles(event) {
        event.preventDefault();
        for (const item of files) {
            const itemDepartment = item.department != null ? item.department : 'Corporate';
            const itemClassification = item.classification != null ? item.classification : 'None';
            let itemFilename;
            if (itemClassification === 'None') itemFilename = itemDepartment + "/" + item.name;
            else itemFilename = itemDepartment + "/" + itemClassification + "/" + item.name;

            const data = {
                name: item.documentName == null ? item.name : item.documentName,
                description: item.description != null ? item.description : 'Anycompany Artifact',
                department: itemDepartment,
                classification: itemClassification,
                fileName: itemFilename,
            };
            console.log('data', data.fileName)
            if (!!data.fileName) {
                await Storage.put(data.fileName, item, {
                    metadata: data,
                    contentType: item.type
                });
            }
            await API.graphql({
                query: createArtifactMutation,
                variables: {input: data},
            });
        }
        await fetchArtifacts();
        event.target.reset();
        setFiles([]);
    }

    async function deleteNote({id, fileName}) {
        const newNotes = artifacts.filter((note) => note.id !== id);
        setArtifacts(newNotes);
        await Storage.remove(fileName);
        await API.graphql({
            query: deleteArtifactMutation,
            variables: {input: {id}},
        });
    }

    function removeFile(index) {
        const newFiles = files.filter((item, i) => i !== index);
        setFiles(newFiles);
    }

    return (
        <Flex
            direction={{base: 'column', large: 'column'}}
            padding="1rem"
            width="90%"
            style={{display: "block", margin: "10px auto"}}
        >
            <Heading level={3} style={{textAlign: "left"}}>Artifacts</Heading>
            <View as="form" style={{margin: "15px 0", padding: "15px", border: "1px solid lightgrey"}}
                  onSubmit={uploadFiles}>
                <Flex direction="row" alignItems="center" justifyContent="center"
                      style={{width: "70%", margin: "10px auto"}}>
                    <View
                        name="fileName"
                        as="input"
                        type="file"
                        multiple
                        onChange={(event) => {
                            const chosenFiles = Array.prototype.slice.call(event.target.files);
                            setFiles(chosenFiles);
                        }}
                    />
                    <Button type="submit" variation="primary">
                        Upload Files
                    </Button>
                </Flex>
                <Table
                    className="upload-table"
                    caption=""
                    highlightOnHover="true">
                    <TableHead>
                        <TableRow>
                            <TableCell as="th">File Name</TableCell>
                            <TableCell as="th">Document Name</TableCell>
                            <TableCell as="th">Department</TableCell>
                            <TableCell as="th">Classification</TableCell>
                            <TableCell as="th">Description</TableCell>
                            <TableCell as="th">Encrypt?</TableCell>
                            <TableCell as="th"></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {files.map((item, index) => {
                            return <TableRow key={index}>
                                <TableCell>
                                    {item.name}
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        name="name"
                                        placeholder={item.name}
                                        defaultValue={item.name}
                                        label="Document Name"
                                        labelHidden
                                        variation="quiet"
                                        onBlur={(e) => item.documentName = e.target.value}
                                    />
                                </TableCell>
                                <TableCell>
                                    <SelectField label="Department"
                                                 name="department"
                                                 labelHidden
                                                 variation="quiet"
                                                 defaultValue="Corporate"
                                                 onChange={(e) => item.department = e.target.value}
                                    >
                                        <option value="Corporate">Corporate</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Engineering">Engineering</option>
                                        <option value="Quality">Quality</option>
                                    </SelectField>
                                </TableCell>
                                <TableCell>
                                    <SelectField label="Classification"
                                                 name="classification"
                                                 variation="quiet"
                                                 labelHidden
                                                 defaultValue="None"
                                                 onChange={(e) => item.classification = e.target.value}
                                    >
                                        <option value="None">None</option>
                                        <option value="Confidential">Confidential</option>
                                        <option value="Internal">Internal Only</option>
                                        <option value="Sensitive">Sensitive</option>
                                        <option value="Classified">Classified</option>
                                    </SelectField>
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        name="description"
                                        placeholder="Add a short description"
                                        label="Short Description"
                                        defaultValue="AnyCompany Artifact"
                                        labelHidden
                                        variation="quiet"
                                        onBlur={(e) => item.description = e.target.value}
                                        style={{width: "400px"}}
                                    />
                                </TableCell>
                                <TableCell>
                                    <CheckboxField
                                        name="encrypt"
                                        value="no"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Button variation="link" onClick={() => removeFile(index)}>
                                        Remove
                                    </Button>
                                </TableCell>
                            </TableRow>
                        })}
                    </TableBody>
                </Table>
            </View>
            <Heading margin="3em 0 0 0" level={5}>Uploaded Files</Heading>
            <View margin="2em 0 0 0">
                <Table
                    className="upload-table"
                    caption=""
                    cellPadding="30px"
                    variation="striped"
                    highlightOnHover="true">
                    <TableHead>
                        <TableRow>
                            <TableCell as="th">Department</TableCell>
                            <TableCell as="th">Classification</TableCell>
                            <TableCell as="th">File Name</TableCell>
                            <TableCell as="th">Document Name</TableCell>
                            <TableCell as="th">Description</TableCell>
                            <TableCell as="th">Created At</TableCell>
                            <TableCell as="th">Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {artifacts.map((item) => (
                            <TableRow key={item.id || item.name}>
                                <TableCell>{item.department}</TableCell>
                                <TableCell>{item.classification}</TableCell>
                                <TableCell><a href={item.fileUrl}>{item.fileName}</a></TableCell>
                                <TableCell>
                                    {item.name}
                                </TableCell>
                                <TableCell>{item.description}</TableCell>
                                <TableCell>{item.createdAt}</TableCell>
                                <TableCell>
                                    <Button variation="link" onClick={() => deleteNote(item)}>
                                        Delete note
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </View>
        </Flex>
    );
};

export default UploadFiles;