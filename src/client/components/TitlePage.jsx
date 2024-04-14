import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { grey } from '@mui/material/colors';

import {
  Grid,
  Box,
  Typography,
  Button,
  Paper,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';

import Layout from './Layout';
import { Url } from '../game/settings';
import { Meta } from '../common';

const meta = new Map(Meta);
const title = meta.get('title');
const subtitle = meta.get('subtitle');
const description = meta.get('description');

const ColumnGrid = styled(Grid)(({ theme }) => ({
  height: '100%',
  flexDirection: 'column',
}));

const Row = styled(Grid)(({ theme }) => ({
  margin: theme.spacing(2, 0),
}));

function TitlePage({ gameLink, toggleFullScreen }) {
  const { gameStarted, isFullscreen } = useSelector((state) => state.system);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    //

    return () => {
      //
    };
  }, []);

  const playGame = (e) => {
    e.preventDefault();
    navigate('/game');
  };

  return (
    <Layout>
      <ColumnGrid container>
        <Row item sx={{ mt: theme.spacing(4) }}>
          <Typography variant="h1" align="center">
            {title}
            <Typography
              variant="subtitle1"
              component="span"
              sx={{ display: 'inline', pl: theme.spacing(2) }}
            >
              {' '}
              - {subtitle}
            </Typography>
          </Typography>
        </Row>
        <Row item sx={{ display: 'flex', gap: theme.spacing(1) }}>
          <Typography variant="body1">{description}</Typography>
        </Row>
        <Row
          item
          sx={{ display: 'flex', flexGrow: 1, justifyContent: 'center' }}
        >
          <Box
            component="img"
            sx={{
              width: 1,
              maxHeight: { xs: 360, md: 480 },
              maxWidth: { xs: 480, md: 640 },
            }}
            src="assets/images/game-image-1.png"
            alt="screenshot"
          />
        </Row>
        <Row
          container
          item
          sx={{ gap: theme.spacing(1), justifyContent: 'center' }}
        >
          <Button
            variant="contained"
            component={Link}
            to={gameLink}
            disabled={gameStarted}
          >
            ゲームを開始する
          </Button>
        </Row>
        <Row item>
          <Typography variant="h5">操作方法</Typography>
          <TableContainer
            component={Paper}
            sx={{ my: theme.spacing(1), backgroundColor: grey[100] }}
          >
            <Table sx={{ minWidth: 600 }} aria-label="simple table">
              <TableBody>
                <TableRow>
                  <TableCell component="th" scope="row">
                    キーボードのW/S
                    <br />
                    または 十字キーの上下
                  </TableCell>
                  <TableCell align="right">キャラクターの前進と後退</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    キーボードのA/D
                    <br />
                    または 十字キーの左右
                  </TableCell>
                  <TableCell align="right">
                    キャラクターが左右へ旋回する
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    キーボードのQ/E
                  </TableCell>
                  <TableCell align="right">
                    キャラクターが左右に平行移動する
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    シフトキーを押しながら W<br />
                    または 十字キーの上
                  </TableCell>
                  <TableCell align="right">
                    キャラクターがダッシュ移動する（前方へのみ可能）
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    マウス操作
                  </TableCell>
                  <TableCell align="right">
                    プレイヤーの視点を移動する（キャラクターの身体の向きは変わらないので注意）
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    マウスの左クリック
                  </TableCell>
                  <TableCell align="right">弾丸を発射する</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    マウスホイールを回転する
                  </TableCell>
                  <TableCell align="right">
                    プレイヤーの視点の仰俯角を調整する
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    マウスホイールをクリック
                  </TableCell>
                  <TableCell align="right">
                    プレイヤーの視点の仰角をデフォルトの角度（水平）に戻す
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    マウスの右クリック
                  </TableCell>
                  <TableCell align="right">
                    プレイヤーの視点をデフォルト位置（キャラクター正面）に戻す
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    マウスの右クリック長押し
                  </TableCell>
                  <TableCell align="right">
                    キャラクターの旋回とプレイヤーの視点の連動を解除する
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    キーボードのスペースポタン
                  </TableCell>
                  <TableCell align="right">
                    キャラクターがジャンプする
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    キーボードのW/S/Q/E
                    <br />
                    または 十字キーの上下をすばやく2回押す
                  </TableCell>
                  <TableCell align="right">
                    キャラクターがその方向に緊急回避する
                  </TableCell>
                </TableRow>
                <TableRow
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    キーボードのA/S
                    <br />
                    または 十字キーの左右をすばやく2回押す
                  </TableCell>
                  <TableCell align="right">
                    キャラクターがすばやく真後ろを向く
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Row>
        <Row
          container
          item
          sx={{
            mb: theme.spacing(4),
            gap: theme.spacing(1),
            justifyContent: 'flex-end',
          }}
        >
          <Button variant="outlined" onClick={toggleFullScreen}>
            {!isFullscreen ? '全画面にする' : '全画面を解除'}
          </Button>
        </Row>
      </ColumnGrid>
    </Layout>
  );
}

TitlePage.propTypes = {
  //
};

export default TitlePage;
