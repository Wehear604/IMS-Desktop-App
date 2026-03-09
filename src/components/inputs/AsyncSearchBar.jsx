import { forwardRef, memo, useEffect, useState } from "react";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import { StyledSearchBar } from "./SearchBar";

const AsyncSearchBar = forwardRef(({ onChange, InputComponent, defaultValue, InputProps: incomingInputProps, ...props }, ref) => {
    const [timeOut, setTimeOutState] = useState();
    const [val, setVal] = useState(defaultValue ?? "");
    const [firstTimeLoaded, setFirstTimeLoaded] = useState(false);

    useEffect(() => {
        if (firstTimeLoaded) {
            if (timeOut) {
                clearTimeout(timeOut);
            }
            const fun = () => {
                onChange(val);
                clearTimeout(timeOut);
            };

            const newTimeOut = setTimeout(fun, 500);
            setTimeOutState(newTimeOut);
        } else setFirstTimeLoaded(true);

        return () => {
            if (timeOut) clearTimeout(timeOut);
        };
    }, [val]);

    const mergedInputProps = {
        ...(incomingInputProps || {}),
        startAdornment: (
            <>
                {incomingInputProps && incomingInputProps.startAdornment}
                <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                </InputAdornment>
            </>
        ),
    };

    return (
        <StyledSearchBar
            ref={ref}
            {...props}
            value={val}
            onChange={(e) => {
                setVal(e.target.value);
            }}
            InputProps={mergedInputProps}
        />
    );
});

export default memo(AsyncSearchBar);
