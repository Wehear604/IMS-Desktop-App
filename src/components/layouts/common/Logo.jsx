import { CenteredBox } from "./boxes"
import LogoImage from './../../../assets/images/CompanyLogo.svg'
const Logo = ({...rest}) => {
    return <CenteredBox  {...rest}>
        <img src={LogoImage} style={{ width: "100%",maxWidth: "150px",objectFit:"contain" }} alt="" />
    </CenteredBox>
}
export default Logo