import styled from "styled-components";

export const Box = styled.div`
    padding: 8px 0;
    background: white;
    bottom: 0;
    width: 100%;
    border-top: 1px solid #a3a3a3;
`;

export const FooterContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 24px;
`;

export const Column = styled.div`
    display: flex;
    flex-direction: column;
    text-align: left;
    margin-left: 60px;
`;

export const Row = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    /*should more columns be added return to this below*/
    /*display: grid;
    grid-template-columns: repeat(auto-fill, minmax(185px, 1fr));
    grid-gap: 20px;

    @media (max-width: 1000px) {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }*/
`;

export const FooterLink = styled.a`
    color: #000000;
    margin-bottom: 6px;
    font-size: 14px;
    text-decoration: none;

    &:hover {
        color: gray;
        transition: 200ms ease-in;
    }
`;

export const Heading = styled.p`
    font-size: 9px;
    color: #000000;
    margin-bottom: 0px;
    font-weight: bold;
`;

export const FooterDivider = styled.div`
    width: 100%;
    height: 1px;
    background-color: #444;
    margin-bottom: 40px;
`;