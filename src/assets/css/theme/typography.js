
const applyCustomTypoGraphy = (theme) => {

  theme.typography.display1 = {
      fontSize: "61.46px",
      [theme.breakpoints.down('lg')]: {
          fontSize: '55px',
      },
      [theme.breakpoints.down('md')]: {
          fontSize: '40px',
      }
  }
  theme.typography.h1 = {
      fontSize: "48px",
      [theme.breakpoints.down('lg')]: {
          fontSize: '42px',
      },
      [theme.breakpoints.down('md')]: {
          fontSize: '30px',
      }
  }
  theme.typography.button = {
      fontSize: "24px",
      fontWeight:500,
      // lineHeight:"100%",
      [theme.breakpoints.down('lg')]: {
          fontSize: '22px',
      
      },
      [theme.breakpoints.down('md')]: {
          fontSize: '20px',
      
      }
  }
  theme.typography.h2 = {
      fontSize: "32px",
      [theme.breakpoints.down('lg')]: {
          fontSize: '28px',
      },
      [theme.breakpoints.down('md')]: {
          fontSize: '18px',
      }
  }
  theme.typography.h3 = {
      fontSize: "22px",
      fontWeight:"600",
      [theme.breakpoints.down('lg')]: {
          fontSize: '18px',
      },
      [theme.breakpoints.down('md')]: {
          fontSize: '12px',
      }
  }
  theme.typography.h4 = {
      fontSize: "20px",

      [theme.breakpoints.down('lg')]: {
          fontSize: '18px',
      },
      [theme.breakpoints.down('md')]: {
          fontSize: '14px',
      }
  }
  theme.typography.h5 = {
      fontSize: "18px",

      [theme.breakpoints.down('lg')]: {
          fontSize: '16px',
      },
      [theme.breakpoints.down('md')]: {
          fontSize: '12px',
      }
  }
  theme.typography.h6 = {
      fontSize: "16px",
      fontWeight: "normal",
      lineHeight:"24px",
     
      [theme.breakpoints.down('lg')]: {
          fontSize: '14px',
          lineHeight:"24px",
      },
      [theme.breakpoints.down('md')]: {
          fontSize: '10px',
          lineHeight:"14px",
      }
  }
  theme.typography.button = {
      fontSize: "24px",
      fontWeight: "normal",
      [theme.breakpoints.down('lg')]: {
          fontSize: '24px',
      },
      [theme.breakpoints.down('md')]: {
          fontSize: '14px',
      }
  }
  theme.typography.subtitle1 = {
      fontSize: "14px",
      fontWeight: "normal",
      [theme.breakpoints.down('lg')]: {
          fontSize: '10px',
      },
      [theme.breakpoints.down('md')]: {
          fontSize: '10px',
      }
  }
  theme.typography.subtitle2 = {
      fontSize: "12px",
      fontWeight: "normal",
      [theme.breakpoints.down('lg')]: {
          fontSize: '10px',
      },
      [theme.breakpoints.down('md')]: {
          fontSize: '10px',
      }
  }
  
  return theme

}
export default applyCustomTypoGraphy