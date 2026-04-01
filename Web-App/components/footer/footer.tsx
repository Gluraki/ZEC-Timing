import React from "react";
import {
    Box,
    FooterContainer,
    Row,
    Column,
    FooterLink,
    Heading,
} from "./footerstyles";

const Footer: React.FC = () => {
    return (
        <Box>
            <FooterContainer>
                <Row>
                    <Column>
                        <p>© HTL Weiz 2026</p>
                        <FooterLink href="https://htlweiz.at/impressum">Impressum und Datenschutz</FooterLink>
                    </Column>
                </Row>
            </FooterContainer>
        </Box>
    );
};

export default Footer;
