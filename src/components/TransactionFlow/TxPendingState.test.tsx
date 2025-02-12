import { ComponentProps } from 'react';

import { simpleRender, waitFor } from 'test-utils';

import { Fiats } from '@config';
import { fNetwork, fTxConfigEIP1559, fTxReceiptEIP1559 } from '@fixtures';
import { translateRaw } from '@translations';
import { ITxStatus, WalletId } from '@types';

import { TxPendingState } from './TxPendingState';

const defaultProps: ComponentProps<typeof TxPendingState> = {
  network: fNetwork,
  baseAssetRate: 250,
  txConfig: fTxConfigEIP1559,
  txReceipt: fTxReceiptEIP1559,
  fiat: Fiats.USD,
  showDetails: jest.fn(),
  setLabel: jest.fn()
};

function getComponent(props: ComponentProps<typeof TxPendingState>) {
  return simpleRender(<TxPendingState {...props} />);
}

describe('TxPendingState', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('shows pending state', async () => {
    const { getByText } = getComponent(defaultProps);
    expect(getByText(translateRaw('TRANSACTION_PENDING_DESCRIPTION'))).toBeDefined();
    await waitFor(() =>
      expect(defaultProps.setLabel).toHaveBeenCalledWith(translateRaw('TRANSACTION_PENDING_HEADER'))
    );
  });

  it('shows crowded state after 20 sec', async () => {
    const { getByText } = getComponent(defaultProps);
    jest.runOnlyPendingTimers();
    expect(getByText(translateRaw('TRANSACTION_CROWDED_DESCRIPTION'))).toBeDefined();
    await waitFor(() =>
      expect(defaultProps.setLabel).toHaveBeenCalledWith(translateRaw('TRANSACTION_CROWDED_HEADER'))
    );
  });

  it('shows success state', async () => {
    const { getByText } = getComponent({
      ...defaultProps,
      txReceipt: { ...defaultProps.txReceipt, status: ITxStatus.SUCCESS }
    });
    jest.runOnlyPendingTimers();
    expect(getByText(translateRaw('TRANSACTION_SUCCESS_DESCRIPTION'))).toBeDefined();
    await waitFor(() =>
      expect(defaultProps.setLabel).toHaveBeenCalledWith(translateRaw('TRANSACTION_SUCCESS_HEADER'))
    );
  });

  it('shows web3 notice', async () => {
    const { getByText } = getComponent(defaultProps);
    jest.runOnlyPendingTimers();
    expect(getByText('Please use your Web3 Provider directly', { exact: false })).toBeDefined();
  });

  it('shows MetaMask notice', async () => {
    const { getByText } = getComponent({
      ...defaultProps,
      txConfig: {
        ...fTxConfigEIP1559,
        senderAccount: { ...fTxConfigEIP1559.senderAccount, wallet: WalletId.METAMASK }
      }
    });
    jest.runOnlyPendingTimers();
    expect(getByText(translateRaw('PENDING_METAMASK_NOTICE'))).toBeDefined();
  });

  it('shows resend for HW', async () => {
    const { getByText } = getComponent({
      ...defaultProps,
      txConfig: {
        ...fTxConfigEIP1559,
        senderAccount: { ...fTxConfigEIP1559.senderAccount, wallet: WalletId.LEDGER_NANO_S_NEW }
      }
    });
    jest.runOnlyPendingTimers();
    expect(getByText(translateRaw('RESEND_TRANSACTION'))).toBeDefined();
  });
});
