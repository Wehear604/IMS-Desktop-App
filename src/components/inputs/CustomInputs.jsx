import { IconButton, InputAdornment, TextField, styled } from "@mui/material"

import { useState } from "react"
import { VisibilityOffOutlined, VisibilityOutlined } from "@mui/icons-material";
const StyledTextField = styled(TextField)(({ theme }) => ({
    background: theme.palette.light.main + "!important",
    '*': {
        color: theme.palette.primary.main,
    },
    '& .MuiOutlinedInput-root': {
        background: "white",
        '&:hover fieldset label': {
            color: 'white',
        },
        'fieldset': {
            borderColor: theme.palette.primary.main,
        },
    },


}));
const CustomInput = (props) => {

    const [type, setType] = useState(props.type ? props.type : "text")
    if (props.type === "password") {

        return (
            <StyledTextField


                fullWidth={true}
                id="outlined-adornment-password"
                className="row"
                label={props.label}
                {...props}
                sx={(theme) => {

                }}
                type={type}
                InputProps={{
                    endAdornment:
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => { setType(type === "password" ? "text" : "password") }}
                                color="primary"
                                edge="end"
                            >
                                {type === "password" ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                            </IconButton>
                        </InputAdornment>
                }}

            />
        )

    }
    if (props.type === "side-icon") {

        return (


            <StyledTextField
                fullWidth={true}

                id="outlined-adornment-password"
                className="row"
                label={props.label}
                {...props}
                type={props.inputType ? props.inputType : 'text'}
                sx={(theme) => {

                }}
                endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => { props.on_side_btn_click() }}
                            color="secondary"
                            edge="end"
                        >
                            {props.side_icon}
                        </IconButton>
                    </InputAdornment>
                }
            />

        )

    }

    return (
        <StyledTextField
            fullWidth={true}
            margin="dense"

            inputProps={{
                sx: {

                    borderRadius: "inherit"
                }
            }}
            sx={(theme) => {
                const css = { background: "white", borderTopLeftRadius: theme.shape.borderRadius, borderTopRightRadius: theme.shape.borderRadius }
                if (props.sx) {
                    return { ...css, ...props.sx }
                }

                return css

            }}
            {...props}
        />
    )

}
export default CustomInput
