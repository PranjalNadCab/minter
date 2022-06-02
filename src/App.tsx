import { useRef, useState } from "react";
import {
  List,
  ListItemText,
  ListItem,
  Card,
  Button,
  MenuItem,
  CardContent,
  TextField,
  Select,
} from "@mui/material";

import "./App.css";
import {
  JettonDeployState,
  TransactionSender,
  JettonDeployController,
  EnvProfiles,
  Environments,
  ContractDeployer,
  TonDeepLinkTransactionSender,
  ChromeExtensionTransactionSender,
  IPFSWebUploader,
} from "tonstarter-contracts";
import { RecoilRoot, atom, useRecoilState } from "recoil";
import { Address, TonClient, toNano } from "ton";

const jettonStateAtom = atom({
  key: "jettonState", // unique ID (with respect to other atoms/selectors)
  default: {
    state: JettonDeployState.NOT_STARTED,
    contractAddress: null,
    jWalletAddress: null,
  }, // default value (aka initial value)
});

function App() {
  return (
    <RecoilRoot>
      <MyComp />
      <div className="App">
        <div style={{ display: "flex", flexDirection: "row", gap: 50 }}>
          <MuiBasedFormTemp />
          <FormDeployStatus />
        </div>
      </div>
    </RecoilRoot>
  );
}

const deployStateAtom = atom({
  key: "deployState",
  default: {
    state: JettonDeployState.NOT_STARTED,
    contractAddress: null,
    jWalletAddress: null,
    jWalletBalance: null,
  },
});

function FormDeployStatus() {
  const [state, setState] = useRecoilState(deployStateAtom);

  return (
    <div>
      <List
        sx={{
          width: "100%",
          maxWidth: 360,
          bgcolor: "background.paper",
        }}
      >
        <ListItem>
          <ListItemText
            primary="Contract Address"
            secondary={state.contractAddress}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="JWallet Address"
            secondary={state.jWalletAddress}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="JWallet Balance"
            secondary={state.jWalletBalance}
          />
        </ListItem>
        <ListItem>
          <Card>
            <CardContent>
              <div>Raw content</div>
              <br />
              {/* <code>{JSON.stringify({koko: 1})}</code> */}
              {/* <Skeleton variant="rectangular" width={210} height={118} /> */}
            </CardContent>
          </Card>
        </ListItem>
      </List>
    </div>
  );
}

interface JettonForm {
  name?: string;
  symbol?: string;
  initialSupply?: number;
  maxSupply?: number;
  tokenDecimals?: number;
}

enum Networks {
  Mainnet,
  Sandbox,
  Testnet,
}

const formSpec = {
  name: {
    title: "Name",
    helper: "Choose a name for your token",
    type: "text",
    default: "",
  },
  symbol: {
    title: "Symbol",
    helper: "Choose a symbol for your token (usually 3-5 chars)",
    type: "text",
    inputStyle: { textTransform: "uppercase" },
    default: "",
  },
  initialSupply: {
    title: "Initial supply",
    helper: "Initial supply of token. usually 0?",
    type: "number",
    disabled: true,
    default: 0,
  },
  maxSupply: {
    title: "Max supply",
    helper: "Not yet supported",
    type: "number",
    disabled: true,
    default: 0,
  },
  decimals: {
    title: "Token decimals",
    helper: "The decimal precision of your token",
    type: "number",
    disabled: true,
    default: 9,
  },
  network: {
    title: "Network",
    helper: "Choose network",
    type: "select",
    default: Networks.Mainnet,
    options: [Networks.Mainnet, Networks.Sandbox, Networks.Testnet],
    optionToDisplayName: (o: Networks) => Networks[o],
  },
  mintToOwner: {
    title: "Mint to owner",
    helper: "Amount of jetton to transfer to owner jwallet",
    type: "number",
    default: 100,
  },
  gasFee: {
    title: "Gas fee",
    helper:
      "Amount of to send from your wallet to jetton contract for gas and rent",
    type: "number",
    disabled: true,
    default: 0.3,
  },
};

const defaults: JettonForm = {};

Object.entries(formSpec).forEach(([k, v]) => {
  // @ts-ignore
  defaults[k] = v.default;
});

const formStateAtom = atom({
  key: "formState", // unique ID (with respect to other atoms/selectors)
  default: defaults,
});

function MuiBasedFormTemp() {
  // const { register, handleSubmit, watch, formState: { errors }, control } = useForm();

  // console.log(watch("koko")); // watch input value by passing the name of it
  const [formState, setFormState] = useRecoilState(formStateAtom);

  const formStateSetter = (e: any, k: string) => {
    setFormState((o) => ({ ...o, [k]: e.target.value }));
  };

  const toTextField = (k: string) => {
    const {
      disabled,
      helper,
      type,
      title,
      inputStyle,
      options,
      optionToDisplayName,
    } =
      // @ts-ignore
      formSpec[k];
    return (
      <TextField
        onChange={(e: any) => {
          formStateSetter(e, k);
        }}
        // @ts-ignore
        value={formState[k]}
        disabled={disabled}
        helperText={helper}
        type={type}
        label={title}
        inputProps={{ style: inputStyle }}
      />
    );
  };

  const toSelect = (k: string) => {
    // @ts-ignore
    const {
      disabled,
      helper,
      type,
      title,
      inputStyle,
      options,
      optionToDisplayName,
    } =
      // @ts-ignore
      formSpec[k];
    return (
      <Select
        key={k}
        onChange={(e: any) => {
          formStateSetter(e, k);
        }}
        // @ts-ignore
        value={formState[k]}
        disabled={disabled}
        // @ts-ignore
        helperText={helper}
        type={type}
        label={title}
        inputProps={{ style: inputStyle }}
      >
        {options.map((o: any) => (
          <MenuItem key={o} value={o}>
            {optionToDisplayName(o)}
          </MenuItem>
        ))}
      </Select>
    );
  };

  return (
    <form
      style={{ display: "flex", flexDirection: "column", gap: 20, width: 500 }}
    >
      {toTextField("name")}
      {toTextField("symbol")}
      {toTextField("initialSupply")}
      {toTextField("maxSupply")}
      {toTextField("decimals")}
      {toTextField("mintToOwner")}
      {toSelect("network")}
      {toTextField("gasFee")}

      {/* TODO validations */}
      <input
        type="file"
        onChange={(e) => {
          // myFile.current = e.target.files![0];
        }}
      />

      <Button variant="contained">Deploy Jetton</Button>
    </form>
  );
}

// MARK: functioning old form

function MyComp() {
  const myFile: any = useRef(null);
  const [jettonState, setJettonState] = useRecoilState(jettonStateAtom);
  const [jettonParams, setJettonParams] = useState({
    name: "MyJetton",
    symbol: "JET",
    mintAmount: 100,
    mintToOwner: true,
  });
  const [jettonData, setJettonData] = useState("");

  async function deployContract(
    transactionSender: TransactionSender,
    addressStr: string,
    env: Environments
  ) {
    //@ts-ignore
    const ton = window.ton as any;
    const result = await ton.send("ton_requestWallets");

    if (result.length === 0) throw new Error("NO WALLET");

    const dep = new JettonDeployController(
      // @ts-ignore
      new TonClient({ endpoint: EnvProfiles[env.valueOf()].rpcApi })
    );

    await dep.createJetton(
      {
        owner: Address.parse(addressStr), // TODO from state. this could come from chrome ext
        mintToOwner: false,
        //@ts-ignore
        onProgress: (depState, err, extra) =>
          // @ts-ignore
          setJettonState((oldState) => ({
            // @ts-ignore
            ...oldState,
            state: depState,
            contractAddress:
              depState === JettonDeployState.VERIFY_MINT
                ? extra
                : oldState.contractAddress,
          })),
        jettonIconImageData: myFile.current,
        jettonName: jettonParams.name,
        jettonSymbol: jettonParams.symbol,
        amountToMint: toNano(jettonParams.mintAmount),
      },
      new ContractDeployer(),
      transactionSender,
      new IPFSWebUploader()
    );
  }

  function handleChange(e: any, k: string) {
    setJettonParams((o) => ({ ...o, [k]: e.target.value }));
  }

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ textAlign: "left" }}>
          <form>
            <div>
              Name{" "}
              <input
                type="text"
                value={jettonParams.name}
                onChange={(e) => {
                  handleChange(e, "name");
                }}
              />
            </div>
            <div>
              Symbol{" "}
              <input
                type="text"
                value={jettonParams.symbol}
                onChange={(e) => {
                  handleChange(e, "symbol");
                }}
              />
            </div>
            <div>
              Amount to mint{" "}
              <input
                type="number"
                value={jettonParams.mintAmount}
                onChange={(e) => {
                  handleChange(e, "mintAmount");
                }}
              />
            </div>
            <div>
              Mint to owner <input type="checkbox" defaultChecked disabled />
            </div>
            <div>
              <input
                type="file"
                onChange={(e) => {
                  myFile.current = e.target.files![0];
                }}
              />
            </div>
          </form>
        </div>
        <br />
        <div>Jetton: {JettonDeployState[jettonState.state]}</div>
        <div>{jettonState.contractAddress}</div>
        <div>
          <button
            onClick={async () => {
              await deployContract(
                new TonDeepLinkTransactionSender(
                  EnvProfiles[Environments.MAINNET].deepLinkPrefix
                ),
                "EQDerEPTIh0O8lBdjWc6aLaJs5HYqlfBN2Ruj1lJQH_6vcaZ",
                Environments.MAINNET
              );
            }}
          >
            Deploy contract (tonhubMAINNET)
          </button>
          <button
            onClick={async () => {
              await deployContract(
                new TonDeepLinkTransactionSender(
                  EnvProfiles[Environments.SANDBOX].deepLinkPrefix
                ),
                "kQDBQnDNDtDoiX9np244sZmDcEyIYmMcH1RiIxh59SRpKZsb",
                Environments.SANDBOX
              );
            }}
          >
            Deploy contract (tonhub)
          </button>
          <button
            onClick={async () => {
              // @ts-ignore
              const x = await window.ton!.send("ton_requestWallets");
              await deployContract(
                new ChromeExtensionTransactionSender(),
                x[0].address,
                Environments.TESTNET
              );
            }}
          >
            Deploy contract (chromext)
          </button>
        </div>

        <br />
        <br />
        <div>
          <button
            disabled={jettonState.state !== JettonDeployState.DONE}
            onClick={async () => {
              // TODO acquire env from state
              const dep = new JettonDeployController(
                // @ts-ignore
                new TonClient({
                  endpoint: EnvProfiles[Environments.MAINNET].rpcApi,
                }), // TODO!
              );

              // TODO acquire wallet address from state
              const details = await dep.getJettonDetails(
                Address.parse(jettonState.contractAddress!),
                Address.parse(
                  "kQDBQnDNDtDoiX9np244sZmDcEyIYmMcH1RiIxh59SRpKZsb"
                )
              );

              setJettonData(JSON.stringify(details, null, 3));
            }}
          >
            Get jetton details
          </button>
          <div>
            <textarea
              style={{ width: 600, height: 400 }}
              value={jettonData}
              readOnly
            ></textarea>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
