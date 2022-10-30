import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import { Link as LinkRouter } from 'react-router-dom';

import {
  Badge,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  ListItem,
  ListItemIcon,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import { EnableTelegramDialog } from '.';
import BoltIcon from '@mui/icons-material/Bolt';
import SendIcon from '@mui/icons-material/Send';
import NumbersIcon from '@mui/icons-material/Numbers';
import PasswordIcon from '@mui/icons-material/Password';
import ContentCopy from '@mui/icons-material/ContentCopy';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { UserNinjaIcon, BitcoinIcon } from '../Icons';

import { systemClient } from '../../services/System';
import { getHost, getWebln } from '../../utils';
import RobotAvatar from '../RobotAvatar';
import { apiClient } from '../../services/api';
import { Robot } from '../../models';

interface Props {
  open: boolean;
  onClose: () => void;
  robot: Robot;
  setRobot: (state: Robot) => void;
}

const ProfileDialog = ({ open = false, onClose, robot, setRobot }: Props): JSX.Element => {
  const { t } = useTranslation();
  const theme = useTheme();
  const host = getHost();

  const [rewardInvoice, setRewardInvoice] = useState<string>('');
  const [showRewards, setShowRewards] = useState<boolean>(false);
  const [showRewardsSpinner, setShowRewardsSpinner] = useState<boolean>(false);
  const [withdrawn, setWithdrawn] = useState<boolean>(false);
  const [badInvoice, setBadInvoice] = useState<string>('');
  const [openClaimRewards, setOpenClaimRewards] = useState<boolean>(false);
  const [weblnEnabled, setWeblnEnabled] = useState<boolean>(false);
  const [openEnableTelegram, setOpenEnableTelegram] = useState<boolean>(false);

  useEffect(() => {
    getWebln().then((webln) => {
      setWeblnEnabled(webln !== undefined);
    });
  }, [showRewards]);

  const copyTokenHandler = () => {
    const robotToken = systemClient.getCookie('robot_token');

    if (robotToken) {
      systemClient.copyToClipboard(robotToken);
      setRobot({ ...robot, copiedToken: true });
    }
  };

  const copyReferralCodeHandler = () => {
    systemClient.copyToClipboard(`http://${host}/ref/${robot.referralCode}`);
  };

  const handleWeblnInvoiceClicked = async (e: any) => {
    e.preventDefault();
    if (robot.earnedRewards) {
      const webln = await getWebln();
      const invoice = webln.makeInvoice(robot.earnedRewards).then(() => {
        if (invoice) {
          handleSubmitInvoiceClicked(e, invoice.paymentRequest);
        }
      });
    }
  };

  const handleSubmitInvoiceClicked = (e: any, rewardInvoice: string) => {
    setBadInvoice('');
    setShowRewardsSpinner(true);

    apiClient
      .post('/api/reward/', {
        invoice: rewardInvoice,
      })
      .then((data: any) => {
        setBadInvoice(data.bad_invoice ?? '');
        setShowRewardsSpinner(false);
        setWithdrawn(data.successful_withdrawal);
        setOpenClaimRewards(!data.successful_withdrawal);
        setRobot({ ...robot, earnedRewards: data.successful_withdrawal ? 0 : robot.earnedRewards });
      });
    e.preventDefault();
  };

  const handleClickEnableTelegram = () => {
    window.open('https://t.me/' + robot.tgBotName + '?start=' + robot.tgToken, '_blank').focus();
    setOpenEnableTelegram(false);
  };

  const setStealthInvoice = (wantsStealth: boolean) => {
    apiClient
      .put('/api/stealth/', { wantsStealth })
      .then((data) => setRobot({ ...robot, stealthInvoices: data?.wantsStealth }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby='profile-title'
      aria-describedby='profile-description'
    >
      <DialogContent>
        <Typography component='h5' variant='h5'>
          {t('Your Profile')}
        </Typography>

        <List>
          <Divider />

          <ListItem className='profileNickname'>
            <ListItemText secondary={t('Your robot')}>
              <Typography component='h6' variant='h6'>
                {robot.nickname ? (
                  <div style={{ position: 'relative', left: '-7px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'left',
                        flexWrap: 'wrap',
                        width: 300,
                      }}
                    >
                      <BoltIcon sx={{ color: '#fcba03', height: '28px', width: '24px' }} />

                      <a>{robot.nickname}</a>

                      <BoltIcon sx={{ color: '#fcba03', height: '28px', width: '24px' }} />
                    </div>
                  </div>
                ) : null}
              </Typography>
            </ListItemText>

            <ListItemAvatar>
              <RobotAvatar
                avatarClass='profileAvatar'
                style={{ width: 65, height: 65 }}
                nickname={robot.nickname}
              />
            </ListItemAvatar>
          </ListItem>

          <Divider />

          {robot.activeOrderId ? (
            <ListItemButton
              onClick={onClose}
              to={`/order/${robot.activeOrderId}`}
              component={LinkRouter}
            >
              <ListItemIcon>
                <Badge badgeContent='' color='primary'>
                  <NumbersIcon color='primary' />
                </Badge>
              </ListItemIcon>
              <ListItemText
                primary={t('One active order #{{orderID}}', { orderID: robot.activeOrderId })}
                secondary={t('Your current order')}
              />
            </ListItemButton>
          ) : robot.lastOrderId ? (
            <ListItemButton
              onClick={onClose}
              to={`/order/${robot.lastOrderId}`}
              component={LinkRouter}
            >
              <ListItemIcon>
                <NumbersIcon color='primary' />
              </ListItemIcon>
              <ListItemText
                primary={t('Your last order #{{orderID}}', { orderID: robot.lastOrderId })}
                secondary={t('Inactive order')}
              />
            </ListItemButton>
          ) : (
            <ListItem>
              <ListItemIcon>
                <NumbersIcon />
              </ListItemIcon>
              <ListItemText
                primary={t('No active orders')}
                secondary={t('You do not have previous orders')}
              />
            </ListItem>
          )}

          <ListItem>
            <ListItemIcon>
              <PasswordIcon />
            </ListItemIcon>

            <ListItemText secondary={t('Your token (will not remain here)')}>
              {systemClient.getCookie('robot_token') ? (
                <TextField
                  disabled
                  sx={{ width: '100%', maxWidth: '450px' }}
                  label={t('Back it up!')}
                  value={systemClient.getCookie('robot_token')}
                  variant='filled'
                  size='small'
                  InputProps={{
                    endAdornment: (
                      <Tooltip disableHoverListener enterTouchDelay={0} title={t('Copied!') || ''}>
                        <IconButton onClick={copyTokenHandler}>
                          <ContentCopy color='inherit' />
                        </IconButton>
                      </Tooltip>
                    ),
                  }}
                />
              ) : (
                t('Cannot remember')
              )}
            </ListItemText>
          </ListItem>

          <Divider />

          <EnableTelegramDialog
            open={openEnableTelegram}
            onClose={() => setOpenEnableTelegram(false)}
            tgBotName={robot.tgBotName}
            tgToken={robot.tgToken}
            onClickEnable={handleClickEnableTelegram}
          />

          <ListItem>
            <ListItemIcon>
              <SendIcon />
            </ListItemIcon>

            <ListItemText>
              {robot.tgEnabled ? (
                <Typography color={theme.palette.success.main}>
                  <b>{t('Telegram enabled')}</b>
                </Typography>
              ) : (
                <Button color='primary' onClick={() => setOpenEnableTelegram(true)}>
                  {t('Enable Telegram Notifications')}
                </Button>
              )}
            </ListItemText>
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <UserNinjaIcon />
            </ListItemIcon>

            <ListItemText>
              <Tooltip
                placement='bottom'
                enterTouchDelay={0}
                title={t(
                  "Stealth lightning invoices do not contain details about the trade except an order reference. Enable this setting if you don't want to disclose details to a custodial lightning wallet.",
                )}
              >
                <Grid item>
                  <FormControlLabel
                    labelPlacement='end'
                    label={t('Use stealth invoices')}
                    control={
                      <Switch
                        checked={robot.stealthInvoices}
                        onChange={() => setStealthInvoice(!robot.stealthInvoices)}
                      />
                    }
                  />
                </Grid>
              </Tooltip>
            </ListItemText>
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <BitcoinIcon />
            </ListItemIcon>

            <ListItemText>
              <FormControlLabel
                labelPlacement='end'
                label={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {t('Rewards and compensations')}
                  </div>
                }
                control={
                  <Switch checked={showRewards} onChange={() => setShowRewards(!showRewards)} />
                }
              />
            </ListItemText>
          </ListItem>

          {showRewards && (
            <>
              <ListItem>
                <ListItemIcon>
                  <PersonAddAltIcon />
                </ListItemIcon>

                <ListItemText secondary={t('Share to earn 100 Sats per trade')}>
                  <TextField
                    label={t('Your referral link')}
                    value={host + '/ref/' + robot.referralCode}
                    size='small'
                    InputProps={{
                      endAdornment: (
                        <Tooltip
                          disableHoverListener
                          enterTouchDelay={0}
                          title={t('Copied!') || ''}
                        >
                          <IconButton onClick={copyReferralCodeHandler}>
                            <ContentCopy />
                          </IconButton>
                        </Tooltip>
                      ),
                    }}
                  />
                </ListItemText>
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <EmojiEventsIcon />
                </ListItemIcon>

                {!openClaimRewards ? (
                  <ListItemText secondary={t('Your earned rewards')}>
                    <Grid container>
                      <Grid item xs={9}>
                        <Typography>{`${robot.earnedRewards} Sats`}</Typography>
                      </Grid>

                      <Grid item xs={3}>
                        <Button
                          disabled={robot.earnedRewards === 0}
                          onClick={() => setOpenClaimRewards(true)}
                          variant='contained'
                          size='small'
                        >
                          {t('Claim')}
                        </Button>
                      </Grid>
                    </Grid>
                  </ListItemText>
                ) : (
                  <form noValidate style={{ maxWidth: 270 }}>
                    <Grid container style={{ display: 'flex', alignItems: 'stretch' }}>
                      <Grid item style={{ display: 'flex', maxWidth: 160 }}>
                        <TextField
                          error={!!badInvoice}
                          helperText={badInvoice || ''}
                          label={t('Invoice for {{amountSats}} Sats', {
                            amountSats: robot.earnedRewards,
                          })}
                          size='small'
                          value={rewardInvoice}
                          onChange={(e) => {
                            setRewardInvoice(e.target.value);
                          }}
                        />
                      </Grid>
                      <Grid item alignItems='stretch' style={{ display: 'flex', maxWidth: 80 }}>
                        <Button
                          sx={{ maxHeight: 38 }}
                          onClick={(e) => handleSubmitInvoiceClicked(e, rewardInvoice)}
                          variant='contained'
                          color='primary'
                          size='small'
                          type='submit'
                        >
                          {t('Submit')}
                        </Button>
                      </Grid>
                    </Grid>
                    {weblnEnabled && (
                      <Grid container style={{ display: 'flex', alignItems: 'stretch' }}>
                        <Grid item alignItems='stretch' style={{ display: 'flex', maxWidth: 240 }}>
                          <Button
                            sx={{ maxHeight: 38, minWidth: 230 }}
                            onClick={async (e) => await handleWeblnInvoiceClicked(e)}
                            variant='contained'
                            color='primary'
                            size='small'
                            type='submit'
                          >
                            {t('Generate with Webln')}
                          </Button>
                        </Grid>
                      </Grid>
                    )}
                  </form>
                )}
              </ListItem>

              {showRewardsSpinner && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress />
                </div>
              )}

              {withdrawn && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Typography color='primary' variant='body2'>
                    <b>{t('There it goes, thank you!🥇')}</b>
                  </Typography>
                </div>
              )}
            </>
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
