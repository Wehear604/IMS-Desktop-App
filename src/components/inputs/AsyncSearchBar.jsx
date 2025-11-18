import { forwardRef, memo, useEffect, useState } from "react"
import { StyledSearchBar } from "./SearchBar"

const AsyncSearchBar = forwardRef(({ onChange, InputComponent, defaultValue, ...props },ref) => {
    const [timeOut, setTimeOutState] = useState()
    const [val, setVal] = useState(defaultValue ?? '')
    const [firstTimeLoaded, setFirstTimeLoaded] = useState(false)

    useEffect(() => {
        if (firstTimeLoaded) {
            if (timeOut) {
                clearTimeout(timeOut)
            }
            const fun = () => {
                onChange(val)
                clearTimeout(timeOut)
            }


            const newTimeOut = setTimeout(fun, 500)
            setTimeOutState(newTimeOut)
        } else
            setFirstTimeLoaded(true)

    }, [val])
    return <StyledSearchBar ref={ref} {...props} value={val} onChange={(e) => { setVal(e.target.value) }} />

})
export default memo(AsyncSearchBar)