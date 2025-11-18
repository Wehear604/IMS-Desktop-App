import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import React, { memo, useEffect, useState } from "react";
import { useDispatch } from 'react-redux'
import { callApiAction } from "../../store/actions/commonAction";


const AsyncDropDown = (props) => {

    const NULL_STRING_SEARCH_KEY = '---null---'
    const [buffer, setBuffer] = useState(null)
    const [filters, setFilters] = useState({
        pageNo: 1,
        pageSize: 500,
        search: '',
        isDropDown: true
    })
    const [cache, setCache] = useState({})
    const [loading, setLoading] = useState(false)
    const [options, setOptions] = useState(props.defaultOptions ? props.defaultOptions : []);
    const dispatch = useDispatch()
    

    const fetchOptions = (data, onSucces = () => { }) => {

        if ((filters.search && cache[filters.search]) || (!filters.search && cache[NULL_STRING_SEARCH_KEY]) || (filters.search == '' && cache[NULL_STRING_SEARCH_KEY])) {

            if (filters.search && filters.search != '') {

                setOptions(cache[filters.search])
            }
            else {

                setOptions(cache[NULL_STRING_SEARCH_KEY])
            }
        } else {

            setLoading(true)
            const bodyData = data ? data : { ...filters }
            dispatch(
                callApiAction(
                    async () => await props.lazyFun(bodyData),
                    (response) => {
                        let defaultOptions = []
                        const updatedOptions = response.result
                        if (props.defaultOptions) {
                            defaultOptions = props.defaultOptions
                        }

                        const key = filters.search && filters.search != '' ? filters.search : NULL_STRING_SEARCH_KEY
                        setCache({
                            ...cache,
                            [key]: [...defaultOptions, ...updatedOptions]
                        })
                        onSucces()
                        setOptions([...defaultOptions, ...updatedOptions])
                        setLoading(false)

                    },
                    (err) => {

                        setLoading(false)
                    }
                )
            )
        }
    }
    useEffect(() => {

        if (!loading && buffer && Object.keys(buffer).length > 0) {
            fetchOptions({ ...buffer }, () => {
                if (buffer.search === filters.search) {
                    setBuffer(undefined)
                }
            })
            setBuffer(undefined)
        }
    }, [loading])

    let [timeOut, setTimeOutState] = useState()
    useEffect(() => {

        if (timeOut) {

            clearTimeout(timeOut)
        }
        const fun = () => {

            if (!loading) {
                fetchOptions()
            }
            else
                setBuffer(filters)

            clearTimeout(timeOut)
        }
        if (filters.search && filters.search.length > 0) {
            const newTimeOut = setTimeout(fun, 500)
            setTimeOutState(newTimeOut)
        } else if (cache[NULL_STRING_SEARCH_KEY]) {
            setOptions(cache[NULL_STRING_SEARCH_KEY])
        }


    }, [filters, setBuffer])


    const Component = props.InputComponent ? props.InputComponent : TextField
    const OptionComponent = props.OptionComponent ? props.OptionComponent : null
    return <Autocomplete
        fullWidth={true}
        defaultValue={props.defaultVal}
        value={props.Value}
        autoFocus={false}
        onChange={(e, newVal) => { props.onChange(newVal) }}
        noOptionsText={filters.search.length > 0 ? "No Options" : "Search for the result..."}
        disabled={props.disabled}
        renderOption={(props, option) => OptionComponent ? <OptionComponent option={option} {...props} /> : option[!props.titleKey ? 'title' : props.titleKey]}
        getOptionLabel={(option) => option[!props.titleKey ? 'title' : props.titleKey]}
        options={options}
        loading={loading}
        onFocus={() => {
            if ((options.length == 0 || options.length == props.defaultOptions?.length) && !loading) {
                fetchOptions()
            }
        }}
        renderInput={(params) => (
            <Component

                autoFocus={false}
                onChange={(e) => { setFilters({ ...filters, search: e.target.value }) }}

                margin="dense"
                {...params}

                label={props.label}
                InputProps={{
                    ...params.InputProps,
                    startAdornment: props.startAdornment ? props.startAdornment : params.InputProps.startAdornment ? params.InputProps.startAdornment : null,
                    sx: (theme) => props.inputStyle ? props.inputStyle({ theme }) : {},
                    endAdornment: (
                        <React.Fragment>
                            {loading ? <CircularProgress color="inherit" size={20} /> : null}
                            {!props.hideEndAdornment && params.InputProps.endAdornment}
                        </React.Fragment>
                    ),
                }}

            />
        )}
        multiple={props.multiple}
    />
}
export default memo(AsyncDropDown)
