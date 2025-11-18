import { Box, Divider, Typography } from "@mui/material";
import CustomDialog from "../../components/layouts/common/CustomDialog";
import { QC_TEST_CASE_BAND, QC_TEST_CASE_HEARING_AID } from "../../utils/constants";
import { findObjectKeyByValue } from "../../utils/main";

const QcDashboardDetailsViewUi = ({ title, params }) => {
let groupedQcTests = {};

params?.qc_test?.forEach((test) => {
  console.log("test categorusss",test.category);
  const typeKey = test?.name?.category == 1 ? findObjectKeyByValue(test?.name?.test_case_band,QC_TEST_CASE_BAND) : findObjectKeyByValue(test?.name?.test_case_hearing_aid, QC_TEST_CASE_HEARING_AID);
  console.log("Type Key:", typeKey);

  // if (!typeKey) {
  //   console.log("Unknown test_case_hearing_aid:", test?.name?.test_case_hearing_aid);
  //   return;
  // }

  if (!groupedQcTests[typeKey]) {
    groupedQcTests[typeKey] = [];
  }

  groupedQcTests[typeKey].push({
    testName: test?.name?.name,
    status: test?.value ? "Pass" : "Fail"
  });
});

  return (
    <>
      <CustomDialog id={"qc-dashboard"} title={title}>
          <>
      
      {Object.entries(groupedQcTests).map(([category, tests]) => (
        console.log("category",category),
        console.log("tests",tests),
        <Box
          key={category}
          sx={{
            mb: 3,
            borderRadius: '10px',
            border: '1px solid #9fb1e8',
          }}
        >
          <Box>
            <Typography variant="h5" p={2} m={1} fontWeight="bold" gutterBottom>
              {category}
            </Typography>
            <Divider sx={{ mb: 2, borderColor: '#9fb1e8' }} />

            {tests
              .reduce((rows, item, index, arr) => {
                console.log("Rowsss",rows)
                if (index % 2 === 0) rows.push(arr.slice(index, index + 2));
                return rows;
              }, [])
              .map((pair, rowIndex) => (
                <Box
                  key={rowIndex}
                  sx={{
                    display: 'flex',
                    width: '100%',
                    px: 1,
                    py: 1,
                  }}
                >
                  {pair.map((item, colIndex) => (
                    <Box
                      key={colIndex}
                      width="50%"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        pl: 2,
                        pr: 2,
                        m:1
                      }}
                    >
                      <Box width="40%">
                        <Typography variant="subtitle1">{item.testName}</Typography>
                      </Box>
                      <Box width="10%">
                        <Typography variant="subtitle1">:</Typography>
                      </Box>
                      <Box width="20%">
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          sx={{ color: item.status === 'Pass' ? 'green' : 'red' }}
                        >
                          {item.status}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                  {pair.length === 1 && <Box width="50%" />}
                </Box>
              ))}
          </Box>
        </Box>
      ))}

    </>
      </CustomDialog>
      </>
  );
};

export default QcDashboardDetailsViewUi;
