import {Transport} from './transport';

/**
 * A channel represents a remote endpoint that can be connected to.
 */
export type Channel = {
  address: string;
  transport: Transport;
};

/**
 * Creates a new channel.
 *
 * @param address The address of the server, in the form `protocol://host:port`,
 *     where `protocol` is one of `http` or `https`. If the port is not
 *     specified, it will be inferred from the protocol.
 */
export function createChannel(address: string, transport: Transport): Channel {
  return {address, transport};
}
