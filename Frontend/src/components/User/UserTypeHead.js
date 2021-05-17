import axios from 'axios';
import { useState } from 'react';
import { ListGroup } from 'react-bootstrap';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { connect } from 'react-redux';
import { client } from '../..';
import { searchUser } from '../../graphql/query';
import { SERVER_URL } from '../../_constants';

const SEARCH_URI = SERVER_URL + '/user/search';

function UserTypeHead(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState([]);

  const handleSearch = async (query) => {
    setIsLoading(true);
    await fetchData(query);
    setIsLoading(false);
  };

  const fetchData = async (query) => {
    try {
      const response = await client.query({ query: searchUser, variables: { queryString: query, limit: 20 } });
      if (response.data.searchUser.error) {
        console.log("Error occurred ", response.data.searchUser.error);
      } else {
        const options = response.data.searchUser.users.map((i) => ({
          email: i.email,
          name: `${i.first_name}${i.last_name ? " " + i.last_name : ""}`,
          first_name: i.first_name,
          last_name: i.last_name,
          id: i.email,
        }));
        setOptions(options);
      }
    } catch (err) {
      console.log("Error in fetch Data " + err);
    }
  }

  // Bypass client-side filtering by returning `true`. Results are already
  // filtered by the search endpoint, so no need to do it again.
  const filterBy = (option, skipCurrentUser) => {
    if (skipCurrentUser) {
      return option.email !== props.user.email;
    }
    return true;
  };

  return (
    <AsyncTypeahead
      key={props.key}
      id="userTypeHead"
      filterBy={(option) => filterBy(option, props.skipCurrentUser)}
      isLoading={isLoading}
      labelKey="name"
      minLength={1}
      onSearch={handleSearch}
      options={options}
      placeholder="Search User"
      onChange={props.onChange}
      defaultInputValue={props.initialValue.first_name ? `${props.initialValue.first_name}${props.initialValue.last_name ? " " + props.initialValue.last_name : ""}` : ''}
      renderMenuItemChildren={(option, props) => (
        <ListGroup.Item key={option.email}>
          <span>{option.name}</span>{' '}
          <span>{option.email}</span>
        </ListGroup.Item>
      )}
    />
  );
};

function mapState(state) {
  const { user } = state.authentication;
  return { user };
}

const connectedUserTypeHead = connect(mapState, {})(UserTypeHead);
export { connectedUserTypeHead as UserTypeHead };