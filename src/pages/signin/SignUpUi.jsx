
import CustomInput from '../../components/inputs/CustomInput';
import { Box, Typography } from '@mui/material';
import { CenteredBox } from '../../components/layouts/OneViewBox';
import SubmitButton from '../../components/button/SubmitButton';
import { Link } from 'react-router-dom';
import MainUi from './MainUi';


const SignUpUi = ({ state, setState, onSubmit, loading }) => {

    return (

        <>
            <MainUi state={state} setState={setState} onSubmit={onSubmit} loading={loading}  >
                <Typography align='center' variant="h1" color={"dark"} mb={1}>
                    Sign Up
                </Typography>
                <Typography align='center' variant="h5" color={"red"} mb={1}>
                    {state.err}&nbsp;
                </Typography>
                <Box p={5} pt={0} pb={0} sx={{ width: "100%" }}>
                    <CustomInput
                        margin="dense"
                        disabled={loading}
                        value={state.name}
                        onChange={(e) => setState({ ...state, err: '', name: e.target.value })}
                        type="text"
                        label={"Name*"}
                    />
                    <CustomInput
                        margin="dense"
                        disabled={loading}
                        value={state.email}
                        onChange={(e) => setState({ ...state, err: '', email: e.target.value })}
                        type="text"
                        label={"Email*"}
                    />
                    <Box mt={3} />
                    <CustomInput
                        margin="dense"
                        disabled={loading}
                        value={state.password}
                        onChange={(e) => setState({ ...state, err: '', password: e.target.value })}
                        type="password"
                        label={"Password*"}
                    />
                    <CustomInput
                        margin="dense"
                        disabled={loading}
                        value={state.phone}
                        onChange={(e) => setState({ ...state, err: '', phone: e.target.value })}
                        type="tel"
                        label={"Phone*"}
                    />
                    <Box mt={4}>
                        <SubmitButton variant="contained" loading={loading} disabled={loading} type='submit' title='Sign Up' />
                    </Box>
                    <Box>
                        <CenteredBox mt={4} >
                            <Typography variant='button' color="dark" align='center' >Already have an account? <Link to="/sign-in"  ><Typography sx={{ textDecoration: "underline" }} display="inline" fontWeight="bold" fontSize="inherit"  >Sign In</Typography></Link> </Typography>
                        </CenteredBox>
                    </Box>
                </Box>
            </MainUi>


        </>
    )
}
export default SignUpUi