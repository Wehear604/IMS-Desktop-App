
import CustomInput from '../../components/inputs/CustomInputs';
import { Box, Typography } from '@mui/material';
import { CenteredBox } from '../../components/layouts/OneViewBox';
import SubmitButton from '../../components/button/SubmitButton';
import MainUi from './MainUi';


const SignInUI = ({ state, setState, onSubmit, loading }) => {

    return (

        <>
            <MainUi state={state} setState={setState} onSubmit={onSubmit} loading={loading}  >
                <Box width={"100%"} display={"flex"} flexDirection={"column"} >
                    <Typography align='center' variant="h1" color={"primary"} mb={1}>
                        Log In
                    </Typography>
                    <Typography align='center' variant="h5" color={"red"} mb={1}>
                        {state.err}&nbsp;
                    </Typography>
                    <Box p={5} pt={0} pb={0} sx={{ width: "100%", color: "#0CBABA" }}>
                        <CustomInput
                            margin="dense"
                            disabled={loading}
                            value={state.email}
                            onChange={(e) => setState({ ...state, err: '', email: e.target.value })}
                            type="text"
                            label={"Email"}
                        />
                        <Box mt={3} />
                        <CustomInput
                            margin="dense"
                            disabled={loading}
                            value={state.password}
                            onChange={(e) => setState({ ...state, err: '', password: e.target.value })}
                            type="password"
                            label={"Password"}
                        />
                        <Box mt={4}>
                            <SubmitButton variant="contained" loading={loading} disabled={loading} type='submit' title='Login' />
                        </Box>
                        <Box>
                            <CenteredBox mt={4}>
                                {/* <Typography variant='button' color="dark" align='center' >Create an account? <Link to="/sign-up"  ><Typography sx={{ textDecoration: "underline" }} display="inline" fontWeight="bold" fontSize="inherit"  >Sign Up</Typography></Link> </Typography> */}
                            </CenteredBox>
                        </Box>
                    </Box>
                </Box>
            </MainUi>


        </>
    )
}
export default SignInUI