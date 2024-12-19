import { Box } from "@mui/material";
import image from "../assets/img/60028.jpg";

export default function Building() {
    return (
        <Box
            sx={{
                flexGrow: 1,
                marginTop: 10,
            }}
        >
            <h1
                style={{
                    position: "absolute",
                    left: "36%",
                }}
            >
                Página em construção 🔨
            </h1>
            <Box
                component="img"
                src={image}
                alt="image"
                sx={{
                    width: 500,
                    height: 500,
                    position: "absolute",
                    top: "20%",
                    left: "32%",
                }}
            />
        </Box>
    );
}
