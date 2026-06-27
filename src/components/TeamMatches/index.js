import {Component} from 'react'
import Loader from 'react-loader-spinner'
import {PieChart, Pie, Cell, Legend, Tooltip} from 'recharts'
import LatestMatch from '../LatestMatch'
import MatchCard from '../MatchCard'
import './index.css'

const teamMatchesApiUrl = 'https://apis.ccbp.in/ipl/'

const COLORS = ['#4CAF50', '#F44336', '#FF9800']

class TeamMatches extends Component {
  state = {
    isLoading: true,
    teamMatchesData: {},
  }

  componentDidMount() {
    this.getTeamMatches()
  }

  getFormattedData = data => ({
    umpires: data.umpires,
    result: data.result,
    manOfTheMatch: data.man_of_the_match,
    id: data.id,
    date: data.date,
    venue: data.venue,
    competingTeam: data.competing_team,
    competingTeamLogo: data.competing_team_logo,
    firstInnings: data.first_innings,
    secondInnings: data.second_innings,
    matchStatus: data.match_status,
  })

  getTeamMatches = async () => {
    this.setState({isLoading: true})
    const {match} = this.props
    const {params} = match
    const {id} = params

    try {
      const response = await fetch(`${teamMatchesApiUrl}${id}`)
      const fetchedData = await response.json()
      const formattedData = {
        teamBannerURL: fetchedData.team_banner_url,
        latestMatch: this.getFormattedData(fetchedData.latest_match_details),
        recentMatches: fetchedData.recent_matches.map(eachMatch =>
          this.getFormattedData(eachMatch),
        ),
      }

      this.setState({teamMatchesData: formattedData, isLoading: false})
    } catch (error) {
      console.error('Error fetching team matches:', error)
    }
  }

  onClickBack = () => {
    const {history} = this.props
    history.push('/')
  }

  getPieChartData = () => {
    const {teamMatchesData} = this.state
    const {recentMatches, latestMatch} = teamMatchesData
    const allMatches = [latestMatch, ...recentMatches]

    const won = allMatches.filter(m => m.matchStatus === 'Won').length
    const lost = allMatches.filter(m => m.matchStatus === 'Lost').length
    const drawn = allMatches.filter(m => m.matchStatus === 'Drawn').length

    return [
      {name: `Won - ${won}`, value: won},
      {name: `Lost - ${lost}`, value: lost},
      {name: `Drawn - ${drawn}`, value: drawn},
    ]
  }

  renderPieChart = () => {
    const pieData = this.getPieChartData()

    return (
      <div className="pie-chart-container" data-testid="pie-chart">
        <h1 className="pie-chart-heading">Match Statistics</h1>
        <PieChart width={300} height={300}>
          <Pie
            data={pieData}
            cx={145}
            cy={130}
            outerRadius={110}
            dataKey="value"
            startAngle={0}
            endAngle={360}
          >
            {pieData.map((entry, index) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
    )
  }

  renderRecentMatchesList = () => {
    const {teamMatchesData} = this.state
    const {recentMatches} = teamMatchesData
    return (
      <ul className="recent-matches-list">
        {recentMatches.map(eachMatch => (
          <MatchCard matchDetails={eachMatch} key={eachMatch.id} />
        ))}
      </ul>
    )
  }

  renderTeamMatches = () => {
    const {teamMatchesData} = this.state
    const {teamBannerURL, latestMatch} = teamMatchesData

    return (
      <div className="responsive-container">
        <img src={teamBannerURL} alt="team banner" className="team-banner" />
        <LatestMatch latestMatchData={latestMatch} />
        {this.renderRecentMatchesList()}
        {this.renderPieChart()}
        <button
          type="button"
          className="back-button"
          onClick={this.onClickBack}
        >
          Back
        </button>
      </div>
    )
  }

  renderLoader = () => (
    <div className="loader-container" data-testid="loader">
      <Loader type="Oval" color="#ffffff" height={50} />
    </div>
  )

  getRouteClassName = () => {
    const {match} = this.props
    const {params} = match
    const {id} = params
    switch (id) {
      case 'RCB':
        return 'rcb'
      case 'KKR':
        return 'kkr'
      case 'KXP':
        return 'kxp'
      case 'CSK':
        return 'csk'
      case 'RR':
        return 'rr'
      case 'MI':
        return 'mi'
      case 'SH':
        return 'srh'
      case 'DC':
        return 'dc'
      default:
        return ''
    }
  }

  render() {
    const {isLoading} = this.state
    const className = `team-matches-container ${this.getRouteClassName()}`
    return (
      <div className={className}>
        {isLoading ? this.renderLoader() : this.renderTeamMatches()}
      </div>
    )
  }
}

export default TeamMatches
