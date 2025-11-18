import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { callApiAction } from "../../store/actions/commonAction";
import { useMemo } from "react";
import MacAddressListUi from "./MacAddressListUi";
import { fetchMacAddressApi } from "../../apis/mac-address";
import { useCallback } from "react";

const MacAddressLIstController = () => {
    const dispatch = useDispatch();

    const title = "Mac Address ";
    const fetchApi = fetchMacAddressApi;

    const [filters, setFilters] = useState({
        pageNo: 1,
        pageSize: 10,
        searchable: ["name", "email"],
        search: "",
        role: "",
        sort: "",
        sortDirection: -1,
        deleted: null,
    });

    const columns = useMemo(() => {
        const arr = [
            {
                id: 1,
                fieldName: "uniqueCode",
                label: "Unique Code",
                align: "left",
                sort: true,
                renderValue: (params) => params?.uniqueCode || "",
            },
            {
                id: 2,
                fieldName: "macAddress1",
                label: "MAC Address 1",
                sort: true,
                align: "left",
                renderValue: (params) => params?.macAddress1 || "",
            },
            {
                id: 3,
                fieldName: "macAddress2",
                label: "MAC Address 2",
                sort: true,
                align: "left",
                renderValue: (params) => params?.macAddress2 || "",
            },
            {
                id: 4,
                fieldName: "macAddress3",
                label: "MAC Address 3",
                sort: true,
                align: "left",
                renderValue: (params) => params?.macAddress3 || "",
            },
            {
                id: 5,
                fieldName: "createdAt",
                label: "Time Stamp",
                sort: true,
                align: "left",
                renderValue: (params) => {
                    const date = new Date(params?.createdAt);
                    const optionsTime = { hour: 'numeric', minute: 'numeric', hour12: true };
                    const time = date.toLocaleTimeString('en-US', optionsTime);
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    const formattedDate = `${day}-${month}-${year}`;
                    return `${time} ${formattedDate}`;
                },
            }

        ];
        return arr;
    }, []);

    const [loading, setLoading] = useState(false);
    const [list, setList] = useState({});

    const fetchList = useCallback(() => {
        setLoading(true);
        dispatch(
            callApiAction(
                async () => await fetchApi({ ...filters, isIncentive: true }),
                (response) => {
                    console.log("Mac Address response", response);

                    setList(response);
                    setLoading(false);
                },
                (err) => {
                    setLoading(false);
                }
            )
        );
    }, [dispatch, filters, fetchApi]);

    useEffect(() => {
        fetchList();
    }, [filters, fetchList]);

    return (
        <>
            <MacAddressListUi
                title={title}
                filters={filters}
                setFilters={setFilters}
                loading={loading}
                list={list}
                columns={columns}
            />
        </>
    );
};
export default MacAddressLIstController;
